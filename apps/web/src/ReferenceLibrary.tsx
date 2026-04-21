import { useEffect, useState } from "react"

import {
  getProblemReferenceById,
  getProblemReferencesByPatternGroup,
  getProblemReferencesForAlgorithm,
  getRelatedProblemReferences,
  problemPatternGroups,
  problemReferences,
  type ProblemReference
} from "./problemReferences.js"
import {
  algorithmReferences,
  getAlgorithmReferenceById,
  getRelatedAlgorithmReferences,
  referenceLanguageOrder,
  type AlgorithmReference,
  type ReferenceImplementation,
  type ReferenceLanguageId
} from "./reference.js"
import { type AppRoute } from "./routes.js"

type ReferenceLibraryProps = {
  route: AppRoute
  onBrowseLibrary: () => void
  onOpenReference: (algorithmId: string) => void
  onOpenProblem: (problemId: string) => void
  onOpenReplay: (algorithmId: string) => void
}

function getAccentClass(accent: AlgorithmReference["algorithm"]["accent"]): string {
  return `accent-${accent}`
}

function getProblemAccentClass(problem: ProblemReference): string {
  return `accent-${problem.accent}`
}

function getDomainLabel(domain: AlgorithmReference["algorithm"]["domain"]): string {
  return domain === "sorting" ? "Sorting systems" : "Graph pathfinding"
}

function getPatternGroupCopy(patternGroup: ProblemReference["patternGroup"]): string {
  switch (patternGroup) {
    case "Array & Hashing":
      return "Fast lookup and constraint-tracking problems where the right auxiliary state turns brute force into a linear pass."
    case "Intervals":
      return "Range-overlap and schedule-canonicalization problems that reward ordering first and sweeping once."
    case "Selection & Heaps":
      return "Rank and top-k questions where you avoid full sorting by keeping only the candidates that matter."
    case "Stack":
      return "Delimiter and monotonic-structure problems where LIFO state preserves the right local context."
    case "Sliding Window":
      return "Substring and subarray prompts where a moving boundary maintains a valid invariant in one pass."
    case "Binary Search":
      return "Ordered-search questions that keep discarding half the state by preserving a target-location invariant."
    case "Graph Traversal":
      return "Grid and graph reachability problems that expand through neighbors while marking stable progress."
    case "Shortest Paths":
      return "Weighted routing questions where frontier order and distance relaxation define the solution."
    case "Dynamic Programming":
      return "Optimization prompts where smaller solved states compose into the final answer."
  }
}

function ImplementationDeck({
  implementations,
  resetKey,
  eyebrow,
  title,
  copy
}: {
  implementations: ReferenceImplementation[]
  resetKey: string
  eyebrow: string
  title: string
  copy: string
}) {
  const [languageId, setLanguageId] = useState<ReferenceLanguageId>("typescript")

  useEffect(() => {
    setLanguageId("typescript")
  }, [resetKey])

  const implementation =
    implementations.find((candidate) => candidate.language === languageId) ?? implementations[0]!

  return (
    <section className="panel summary-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <p className="panel-copy">{copy}</p>
      </div>
      <div className="speed-row reference-language-row">
        {referenceLanguageOrder.map((language) => (
          <button
            className={`segmented ${language.id === implementation.language ? "segmented-active" : ""}`}
            key={language.id}
            onClick={() => {
              setLanguageId(language.id)
            }}
            type="button"
          >
            {language.label}
          </button>
        ))}
      </div>
      <div className="reference-code-meta">
        <div>
          <strong>{implementation.label}</strong>
          <p>{implementation.summary}</p>
        </div>
        <span className="number-pill">{implementation.filename}</span>
      </div>
      <pre className="reference-code-block">
        <code>{implementation.code}</code>
      </pre>
    </section>
  )
}

function ProblemCard({
  problem,
  onOpenProblem,
  onOpenReference,
  onOpenReplay
}: {
  problem: ProblemReference
  onOpenProblem: (problemId: string) => void
  onOpenReference: (algorithmId: string) => void
  onOpenReplay: (algorithmId: string) => void
}) {
  const primaryAlgorithm = getAlgorithmReferenceById(problem.primaryAlgorithmIds[0] ?? "")
  const studyAlgorithm = getAlgorithmReferenceById(problem.relatedAlgorithmIds[0] ?? "")

  return (
    <article className={`reference-card ${getProblemAccentClass(problem)}`}>
      <div className="reference-card-header">
        <span className={`algorithm-badge algorithm-badge-${problem.accent}`}>Problem</span>
        <span className="phase-badge">{problem.difficulty}</span>
      </div>
      <div className="reference-card-copy">
        <strong>{problem.title}</strong>
        <p>{problem.summary}</p>
      </div>
      <div className="tag-row">
        {problem.patternTags.map((tag) => (
          <span className="number-pill" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="reference-quick-grid">
        <div className="mini-card">
          <span>Variants</span>
          <strong>{problem.implementationVariants.length}</strong>
        </div>
        <div className="mini-card">
          <span>Languages</span>
          <strong>{problem.implementations.length}</strong>
        </div>
        <div className="mini-card">
          <span>Pattern</span>
          <strong>{problem.patternGroup}</strong>
        </div>
        <div className="mini-card">
          <span>Replay</span>
          <strong>{primaryAlgorithm?.algorithm.name ?? "Study-first"}</strong>
        </div>
      </div>
      <div className="reference-action-row">
        <button
          className="launch-button reference-open-button"
          onClick={() => {
            onOpenProblem(problem.id)
          }}
          type="button"
        >
          Open problem
        </button>
        {primaryAlgorithm ? (
          <button
            className="segmented"
            onClick={() => {
              onOpenReplay(primaryAlgorithm.algorithm.id)
            }}
            type="button"
          >
            Launch replay
          </button>
        ) : studyAlgorithm ? (
          <button
            className="segmented"
            onClick={() => {
              onOpenReference(studyAlgorithm.algorithm.id)
            }}
            type="button"
          >
            Study algorithm
          </button>
        ) : (
          <span className="number-pill">Study-first page</span>
        )}
      </div>
    </article>
  )
}

function ReferenceCatalog({
  missingReferenceId,
  onOpenReference,
  onOpenProblem,
  onOpenReplay
}: Pick<ReferenceLibraryProps, "onOpenReference" | "onOpenProblem" | "onOpenReplay"> & {
  missingReferenceId?: string
}) {
  const referencesByDomain = new Map<string, AlgorithmReference[]>()

  for (const reference of algorithmReferences) {
    const existing = referencesByDomain.get(reference.algorithm.domain) ?? []
    existing.push(reference)
    referencesByDomain.set(reference.algorithm.domain, existing)
  }

  return (
    <div className="reference-stack">
      <section className="panel summary-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Library Coverage</p>
            <h2>Algorithm and named-problem pages in one study surface</h2>
          </div>
          <p className="panel-copy">
            The library now covers both replay-backed algorithms and famous interview-style problem
            references, with shared language tabs and direct handoff into the visualizer.
          </p>
        </div>
        {missingReferenceId ? (
          <div className="error-banner">
            No reference page exists for "{missingReferenceId}". Browse the current library below.
          </div>
        ) : null}
        <div className="summary-grid reference-summary-grid">
          <article className="summary-card">
            <p className="card-kicker">Algorithms</p>
            <h3>{algorithmReferences.length}</h3>
          </article>
          <article className="summary-card">
            <p className="card-kicker">Problem Pages</p>
            <h3>{problemReferences.length}</h3>
          </article>
          <article className="summary-card">
            <p className="card-kicker">Pattern Families</p>
            <h3>{problemPatternGroups.length}</h3>
          </article>
          <article className="summary-card">
            <p className="card-kicker">Languages</p>
            <h3>{referenceLanguageOrder.map((language) => language.label).join(" / ")}</h3>
          </article>
        </div>
      </section>

      {Array.from(referencesByDomain.entries()).map(([domain, references]) => (
        <section className="panel summary-panel" key={domain}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{domain}</p>
              <h2>{getDomainLabel(references[0]!.algorithm.domain)}</h2>
            </div>
            <p className="panel-copy">
              {domain === "sorting"
                ? "Algorithm pages explain runtime tradeoffs and link into pattern-heavy array problems."
                : "Graph pages stay grounded in traversal and shortest-path reasoning, then branch into classic interview problems."}
            </p>
          </div>
          <div className="reference-card-grid">
            {references.map((reference) => (
              <article
                className={`reference-card ${getAccentClass(reference.algorithm.accent)}`}
                key={reference.algorithm.id}
              >
                <div className="reference-card-header">
                  <span
                    className={`algorithm-badge algorithm-badge-${reference.algorithm.accent}`}
                  >
                    {reference.algorithm.badge}
                  </span>
                  <span className="phase-badge">
                    {reference.implementations.length} languages
                  </span>
                </div>
                <div className="reference-card-copy">
                  <strong>{reference.algorithm.name}</strong>
                  <p>{reference.coreIdea}</p>
                </div>
                <div className="reference-quick-grid">
                  <div className="mini-card">
                    <span>Best</span>
                    <strong>{reference.complexity.best}</strong>
                  </div>
                  <div className="mini-card">
                    <span>Worst</span>
                    <strong>{reference.complexity.worst}</strong>
                  </div>
                  <div className="mini-card">
                    <span>Problems</span>
                    <strong>{getProblemReferencesForAlgorithm(reference.algorithm.id).length}</strong>
                  </div>
                </div>
                <div className="reference-action-row">
                  <button
                    className="launch-button reference-open-button"
                    onClick={() => {
                      onOpenReference(reference.algorithm.id)
                    }}
                    type="button"
                  >
                    Open algorithm
                  </button>
                  <button
                    className="segmented"
                    onClick={() => {
                      onOpenReplay(reference.algorithm.id)
                    }}
                    type="button"
                  >
                    Launch replay
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="panel summary-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Named Problems</p>
            <h2>Pattern-grouped study library</h2>
          </div>
          <p className="panel-copy">
            These entries organize well-known interview and LeetCode-style problems by pattern
            family, with multi-language implementations, related practice, and study-first pages
            where replay coverage does not exist yet.
          </p>
        </div>
        <div className="reference-stack">
          {problemPatternGroups.map((patternGroup) => {
            const problems = getProblemReferencesByPatternGroup(patternGroup)

            if (problems.length === 0) {
              return null
            }

            return (
              <section className="panel summary-panel" key={patternGroup}>
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Pattern Family</p>
                    <h2>{patternGroup}</h2>
                  </div>
                  <p className="panel-copy">
                    {getPatternGroupCopy(patternGroup)} {problems.length} problem
                    {problems.length === 1 ? "" : "s"} currently live in this family.
                  </p>
                </div>
                <div className="reference-card-grid">
                  {problems.map((problem) => (
                    <ProblemCard
                      key={problem.id}
                      onOpenProblem={onOpenProblem}
                      onOpenReference={onOpenReference}
                      onOpenReplay={onOpenReplay}
                      problem={problem}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function ReferenceDetail({
  algorithmId,
  onBrowseLibrary,
  onOpenReference,
  onOpenProblem,
  onOpenReplay
}: Pick<
  ReferenceLibraryProps,
  "onBrowseLibrary" | "onOpenReference" | "onOpenProblem" | "onOpenReplay"
> & {
  algorithmId: string
}) {
  const reference = getAlgorithmReferenceById(algorithmId)

  if (!reference) {
    return (
      <ReferenceCatalog
        missingReferenceId={algorithmId}
        onOpenProblem={onOpenProblem}
        onOpenReference={onOpenReference}
        onOpenReplay={onOpenReplay}
      />
    )
  }

  const relatedReferences = getRelatedAlgorithmReferences(reference.algorithm.id)
  const linkedProblems = getProblemReferencesForAlgorithm(reference.algorithm.id)

  return (
    <div className="reference-stack">
      <section className="panel summary-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{reference.algorithm.badge}</p>
            <h2>{reference.algorithm.name}</h2>
          </div>
          <span className={`algorithm-badge algorithm-badge-${reference.algorithm.accent}`}>
            {getDomainLabel(reference.algorithm.domain)}
          </span>
        </div>
        <p className="hero-copy reference-hero-copy">{reference.coreIdea}</p>
        <div className="reference-action-row">
          <button className="segmented" onClick={onBrowseLibrary} type="button">
            Browse library
          </button>
          <button
            className="launch-button reference-open-button"
            onClick={() => {
              onOpenReplay(reference.algorithm.id)
            }}
            type="button"
          >
            Open in replay
          </button>
        </div>
        <div className="reference-fact-grid">
          <article className="metric-card">
            <span>Best</span>
            <strong>{reference.complexity.best}</strong>
            <p className="metric-caption">Fastest observed case</p>
          </article>
          <article className="metric-card">
            <span>Average</span>
            <strong>{reference.complexity.average}</strong>
            <p className="metric-caption">Typical workload shape</p>
          </article>
          <article className="metric-card">
            <span>Worst</span>
            <strong>{reference.complexity.worst}</strong>
            <p className="metric-caption">Upper bound</p>
          </article>
          <article className="metric-card">
            <span>Problem spotlights</span>
            <strong>{linkedProblems.length}</strong>
            <p className="metric-caption">Named problems tied to this algorithm</p>
          </article>
        </div>
        <div className="note-banner">{reference.complexity.note}</div>
      </section>

      <div className="reference-detail-layout">
        <div className="main-column">
          <section className="panel summary-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Why It Works</p>
                <h2>Operational model</h2>
              </div>
            </div>
            <div className="reference-bullet-grid">
              {reference.whyItWorks.map((entry) => (
                <article className="mini-card" key={entry}>
                  <strong>{entry}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="panel summary-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Reasoning Path</p>
                <h2>Step-by-step walkthrough</h2>
              </div>
            </div>
            <ol className="reference-step-list">
              {reference.reasoningSteps.map((step) => (
                <li className="reference-step-card" key={step.title}>
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                </li>
              ))}
            </ol>
          </section>

          <ImplementationDeck
            copy="The snippets below aim for clean interview or reference use, not framework-specific runtime wiring."
            implementations={reference.implementations}
            eyebrow="Implementations"
            resetKey={reference.algorithm.id}
            title="Multi-language starter code"
          />
        </div>

        <aside className="reference-rail">
          <section className="panel summary-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Use Cases</p>
                <h2>Where it fits</h2>
              </div>
            </div>
            <ul className="change-list">
              {reference.useCases.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </section>

          <section className="panel summary-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Interview Framing</p>
                <h2>Questions to practice</h2>
              </div>
            </div>
            <ul className="change-list">
              {reference.interviewPrompts.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </section>

          <section className="panel summary-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Watchouts</p>
                <h2>Common mistakes</h2>
              </div>
            </div>
            <ul className="change-list">
              {reference.watchouts.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </section>

          {linkedProblems.length > 0 ? (
            <section className="panel summary-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Problem Spotlights</p>
                  <h2>Named problems powered by this algorithm</h2>
                </div>
              </div>
              <div className="algorithm-list">
                {linkedProblems.map((problem) => (
                  <button
                    className="algorithm-card"
                    key={problem.id}
                    onClick={() => {
                      onOpenProblem(problem.id)
                    }}
                    type="button"
                  >
                    <span className={`algorithm-badge algorithm-badge-${problem.accent}`}>
                      {problem.difficulty}
                    </span>
                    <strong>{problem.title}</strong>
                    <p>{problem.summary}</p>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {relatedReferences.length > 0 ? (
            <section className="panel summary-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Related</p>
                  <h2>Compare nearby algorithms</h2>
                </div>
              </div>
              <div className="algorithm-list">
                {relatedReferences.map((relatedReference) => (
                  <button
                    className="algorithm-card"
                    key={relatedReference.algorithm.id}
                    onClick={() => {
                      onOpenReference(relatedReference.algorithm.id)
                    }}
                    type="button"
                  >
                    <span
                      className={`algorithm-badge algorithm-badge-${relatedReference.algorithm.accent}`}
                    >
                      {relatedReference.algorithm.badge}
                    </span>
                    <strong>{relatedReference.algorithm.name}</strong>
                    <p>{relatedReference.coreIdea}</p>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

function ProblemDetail({
  problemId,
  onBrowseLibrary,
  onOpenReference,
  onOpenProblem,
  onOpenReplay
}: Pick<
  ReferenceLibraryProps,
  "onBrowseLibrary" | "onOpenReference" | "onOpenProblem" | "onOpenReplay"
> & {
  problemId: string
}) {
  const problem = getProblemReferenceById(problemId)

  if (!problem) {
    return (
      <ReferenceCatalog
        missingReferenceId={problemId}
        onOpenProblem={onOpenProblem}
        onOpenReference={onOpenReference}
        onOpenReplay={onOpenReplay}
      />
    )
  }

  const primaryAlgorithms = problem.primaryAlgorithmIds
    .map((algorithmId) => getAlgorithmReferenceById(algorithmId))
    .filter((reference): reference is AlgorithmReference => reference !== null)
  const relatedAlgorithms = problem.relatedAlgorithmIds
    .map((algorithmId) => getAlgorithmReferenceById(algorithmId))
    .filter((reference): reference is AlgorithmReference => reference !== null)
  const linkedAlgorithms = Array.from(
    new Map(
      [...primaryAlgorithms, ...relatedAlgorithms].map((reference) => [
        reference.algorithm.id,
        reference
      ])
    ).values()
  )
  const relatedProblems = getRelatedProblemReferences(problem.id)

  return (
    <div className="reference-stack">
      <section className={`panel summary-panel reference-problem-hero ${getProblemAccentClass(problem)}`}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{problem.patternGroup}</p>
            <h2>{problem.title}</h2>
          </div>
          <span className={`algorithm-badge algorithm-badge-${problem.accent}`}>
            {problem.difficulty}
          </span>
        </div>
        <p className="hero-copy reference-hero-copy">{problem.summary}</p>
        <div className="note-banner">{problem.problemStatement}</div>
        <div className="reference-action-row">
          <button className="segmented" onClick={onBrowseLibrary} type="button">
            Browse library
          </button>
          {primaryAlgorithms[0] ? (
            <button
              className="launch-button reference-open-button"
              onClick={() => {
                onOpenReplay(primaryAlgorithms[0]!.algorithm.id)
              }}
              type="button"
            >
              Open related replay
            </button>
          ) : null}
        </div>
        <div className="reference-fact-grid">
          <article className="metric-card">
            <span>Difficulty</span>
            <strong>{problem.difficulty}</strong>
            <p className="metric-caption">Interview expectation</p>
          </article>
          <article className="metric-card">
            <span>Pattern Family</span>
            <strong>{problem.patternGroup}</strong>
            <p className="metric-caption">Primary recognition bucket</p>
          </article>
          <article className="metric-card">
            <span>Variants</span>
            <strong>{problem.implementationVariants.length}</strong>
            <p className="metric-caption">Alternative solution shapes</p>
          </article>
          <article className="metric-card">
            <span>Languages</span>
            <strong>{problem.implementations.length}</strong>
            <p className="metric-caption">Solution implementations on this page</p>
          </article>
        </div>
      </section>

      <div className="reference-detail-layout">
        <div className="main-column">
          <section className="panel summary-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Pattern Fit</p>
                <h2>Why this problem matters</h2>
              </div>
            </div>
            <div className="reference-bullet-grid">
              {problem.takeaways.map((entry) => (
                <article className="mini-card" key={entry}>
                  <strong>{entry}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="panel summary-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Implementation Variants</p>
                <h2>Approach options</h2>
              </div>
            </div>
            <div className="reference-variant-grid">
              {problem.implementationVariants.map((variant) => (
                <article className="reference-step-card" key={variant.title}>
                  <strong>{variant.title}</strong>
                  <p>{variant.summary}</p>
                  <p className="metric-caption">{variant.whenToUse}</p>
                </article>
              ))}
            </div>
          </section>

          <ImplementationDeck
            copy="Each snippet targets a clean, interview-ready reference implementation of the primary approach."
            implementations={problem.implementations}
            eyebrow="Problem Implementations"
            resetKey={problem.id}
            title="Multi-language solutions"
          />
        </div>

        <aside className="reference-rail">
          <section className="panel summary-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Pattern Tags</p>
                <h2>Recognition cues</h2>
              </div>
            </div>
            <div className="tag-row">
              {problem.patternTags.map((tag) => (
                <span className="number-pill" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {linkedAlgorithms.length > 0 ? (
            <section className="panel summary-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Related Algorithms</p>
                  <h2>Study the base technique</h2>
                </div>
              </div>
              <div className="algorithm-list">
                {linkedAlgorithms.map((algorithm) => (
                  <button
                    className="algorithm-card"
                    key={algorithm.algorithm.id}
                    onClick={() => {
                      onOpenReference(algorithm.algorithm.id)
                    }}
                    type="button"
                  >
                    <span
                      className={`algorithm-badge algorithm-badge-${algorithm.algorithm.accent}`}
                    >
                      {algorithm.algorithm.badge}
                    </span>
                    <strong>{algorithm.algorithm.name}</strong>
                    <p>{algorithm.coreIdea}</p>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="panel summary-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Study-first page</p>
                  <h2>Pattern-first coverage</h2>
                </div>
              </div>
              <p className="panel-copy">
                This reference page stands on its own as a study guide, even without a matching
                replay-backed algorithm page yet.
              </p>
            </section>
          )}

          {relatedProblems.length > 0 ? (
            <section className="panel summary-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Related Problems</p>
                  <h2>Adjacent practice</h2>
                </div>
              </div>
              <div className="algorithm-list">
                {relatedProblems.map((relatedProblem) => (
                  <button
                    className="algorithm-card"
                    key={relatedProblem.id}
                    onClick={() => {
                      onOpenProblem(relatedProblem.id)
                    }}
                    type="button"
                  >
                    <span className={`algorithm-badge algorithm-badge-${relatedProblem.accent}`}>
                      {relatedProblem.difficulty}
                    </span>
                    <strong>{relatedProblem.title}</strong>
                    <p>{relatedProblem.summary}</p>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

export function ReferenceLibrary({
  route,
  onBrowseLibrary,
  onOpenReference,
  onOpenProblem,
  onOpenReplay
}: ReferenceLibraryProps) {
  if (route.view === "reference-detail") {
    return (
      <ReferenceDetail
        algorithmId={route.algorithmId}
        onBrowseLibrary={onBrowseLibrary}
        onOpenProblem={onOpenProblem}
        onOpenReference={onOpenReference}
        onOpenReplay={onOpenReplay}
      />
    )
  }

  if (route.view === "problem-detail") {
    return (
      <ProblemDetail
        onBrowseLibrary={onBrowseLibrary}
        onOpenProblem={onOpenProblem}
        onOpenReference={onOpenReference}
        onOpenReplay={onOpenReplay}
        problemId={route.problemId}
      />
    )
  }

  return (
    <ReferenceCatalog
      onOpenProblem={onOpenProblem}
      onOpenReference={onOpenReference}
      onOpenReplay={onOpenReplay}
      {...(route.view === "reference-index" && route.missingReferenceId
        ? { missingReferenceId: route.missingReferenceId }
        : {})}
    />
  )
}
