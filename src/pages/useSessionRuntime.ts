import { useEffect, useRef, useState } from 'react'
import type { GeneratedQuestion, SessionConfig } from '../engine/types'
import { generateQuestion, generateQuestions, toTrueFalseStatement } from '../engine/questionGenerator'

export interface AnsweredRecord {
  question: GeneratedQuestion
  userAnswerDisplay: string
  isCorrect: boolean
  responseTimeSeconds: number
}

export interface SessionSummary {
  totalQuestions: number
  correctAnswers: number
  averageTimeSeconds: number
  answers: AnsweredRecord[]
}

type Phase = 'answering' | 'revealed' | 'finished'

export function useSessionRuntime(config: SessionConfig, onFinish: (summary: SessionSummary) => void, started: boolean) {
  const isFixedCount = config.session.mode === 'fixedCount'
  const isSurvival = config.session.mode === 'survival'
  const isTotalTime = config.session.mode === 'totalTime'
  const fixedTotal = config.session.questionCount ?? 20

  const [questions, setQuestions] = useState<GeneratedQuestion[]>(() =>
    isFixedCount ? generateQuestions(config, fixedTotal) : [generateQuestion(config)],
  )
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('answering')
  const [revealVisible, setRevealVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [trueFalseStatement, setTrueFalseStatement] = useState<{ displayText: string; isTrue: boolean } | null>(null)
  const [answers, setAnswers] = useState<AnsweredRecord[]>([])
  const [remainingResponseTime, setRemainingResponseTime] = useState<number | null>(config.timing.responseTimeSeconds)
  const [remainingSessionTime, setRemainingSessionTime] = useState<number | null>(
    isTotalTime ? (config.session.totalTimeSeconds ?? 60) : null,
  )

  const answersRef = useRef<AnsweredRecord[]>([])
  const questionStartRef = useRef(Date.now())
  const finishedRef = useRef(false)
  const delayedRevealTimeoutRef = useRef<number | undefined>(undefined)

  const question: GeneratedQuestion | null = questions[index] ?? null

  function updateAnswers(next: AnsweredRecord[]) {
    answersRef.current = next
    setAnswers(next)
  }

  function finish(finalAnswers: AnsweredRecord[]) {
    if (finishedRef.current) return
    finishedRef.current = true
    setPhase('finished')
    const total = finalAnswers.length
    const correct = finalAnswers.filter((a) => a.isCorrect).length
    const averageTime = total > 0 ? finalAnswers.reduce((sum, a) => sum + a.responseTimeSeconds, 0) / total : 0
    onFinish({ totalQuestions: total, correctAnswers: correct, averageTimeSeconds: averageTime, answers: finalAnswers })
  }

  function goToNextQuestion(currentAnswers: AnsweredRecord[]) {
    const nextIndex = index + 1
    if (isFixedCount && nextIndex >= fixedTotal) {
      finish(currentAnswers)
      return
    }
    if (nextIndex >= questions.length) {
      const avoid = new Set(questions.map((q) => q.displayText))
      const nextQuestion = generateQuestion(config, avoid)
      setQuestions((current) => [...current, nextQuestion])
    }
    setIndex(nextIndex)
  }

  function advanceAfterAnswer() {
    const current = answersRef.current
    const last = current[current.length - 1]
    const shouldStop = (isSurvival && last !== undefined && !last.isCorrect) || (isFixedCount && current.length >= fixedTotal)
    if (shouldStop) {
      finish(current)
    } else {
      goToNextQuestion(current)
    }
  }

  function commitAnswer(userAnswerDisplay: string, isCorrect: boolean) {
    if (phase !== 'answering' || !question) return
    const responseTimeSeconds = (Date.now() - questionStartRef.current) / 1000
    const record: AnsweredRecord = { question, userAnswerDisplay, isCorrect, responseTimeSeconds }
    const nextAnswers = [...answersRef.current, record]
    updateAnswers(nextAnswers)

    const shouldStop = (isSurvival && !isCorrect) || (isFixedCount && nextAnswers.length >= fixedTotal)

    if (config.correction.mode === 'none' || config.correction.mode === 'endOfSeries') {
      if (shouldStop) {
        finish(nextAnswers)
      } else {
        goToNextQuestion(nextAnswers)
      }
      return
    }

    setPhase('revealed')

    if (config.correction.mode === 'immediate') {
      setRevealVisible(true)
    } else if (config.correction.mode === 'onDemand') {
      setRevealVisible(false)
    } else if (config.correction.mode === 'delayed') {
      const elapsed = (Date.now() - questionStartRef.current) / 1000
      const delay = config.correction.delaySeconds ?? 3
      const remainingDelay = Math.max(0, delay - elapsed)
      delayedRevealTimeoutRef.current = window.setTimeout(() => setRevealVisible(true), remainingDelay * 1000)
    }
  }

  function revealOnDemand() {
    setRevealVisible(true)
  }

  // Reset per-question state whenever the active question changes.
  useEffect(() => {
    setInputValue('')
    setPhase('answering')
    setRevealVisible(false)
    questionStartRef.current = Date.now()
    setRemainingResponseTime(config.timing.responseTimeSeconds)
    if (config.answer.inputMode === 'trueFalse' && question) {
      setTrueFalseStatement(toTrueFalseStatement(question))
    } else {
      setTrueFalseStatement(null)
    }
  }, [index, question, config.timing.responseTimeSeconds, config.answer.inputMode])

  // Reset the question clock once the session actually starts, so time spent on the intro screen isn't counted.
  useEffect(() => {
    if (started) questionStartRef.current = Date.now()
  }, [started])

  // Per-question response countdown: auto-submit an empty (wrong) answer on timeout.
  useEffect(() => {
    if (!started || phase !== 'answering' || config.timing.responseTimeSeconds == null) return
    const limit = config.timing.responseTimeSeconds
    const interval = window.setInterval(() => {
      const elapsed = (Date.now() - questionStartRef.current) / 1000
      const remaining = limit - elapsed
      if (remaining <= 0) {
        window.clearInterval(interval)
        setRemainingResponseTime(0)
        commitAnswer('', false)
      } else {
        setRemainingResponseTime(remaining)
      }
    }, 100)
    return () => window.clearInterval(interval)
    // commitAnswer intentionally omitted: it is stable enough for this effect's lifetime (keyed on phase/index).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, started])

  // Whole-session countdown for the `totalTime` mode.
  useEffect(() => {
    if (!isTotalTime || !started) return
    const total = config.session.totalTimeSeconds ?? 60
    const start = Date.now()
    const interval = window.setInterval(() => {
      const elapsed = (Date.now() - start) / 1000
      const remaining = total - elapsed
      if (remaining <= 0) {
        window.clearInterval(interval)
        setRemainingSessionTime(0)
        finish(answersRef.current)
      } else {
        setRemainingSessionTime(remaining)
      }
    }, 250)
    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTotalTime, started])

  // Auto-advance once the correction is visible, for the immediate/delayed modes.
  useEffect(() => {
    if (phase !== 'revealed' || !revealVisible) return
    if (config.correction.mode !== 'immediate' && config.correction.mode !== 'delayed') return
    const timeout = window.setTimeout(advanceAfterAnswer, config.timing.correctionDisplaySeconds * 1000)
    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, revealVisible])

  // Clear any pending delayed-reveal timeout on unmount.
  useEffect(() => {
    return () => {
      if (delayedRevealTimeoutRef.current !== undefined) {
        window.clearTimeout(delayedRevealTimeoutRef.current)
      }
    }
  }, [])

  return {
    question,
    trueFalseStatement,
    phase,
    revealVisible,
    inputValue,
    setInputValue,
    answers,
    remainingResponseTime,
    remainingSessionTime,
    questionNumber: index + 1,
    totalQuestions: isFixedCount ? fixedTotal : null,
    lastAnswer: answers[answers.length - 1] ?? null,
    commitAnswer,
    revealOnDemand,
    advanceAfterAnswer,
  }
}
