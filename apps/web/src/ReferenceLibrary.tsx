import { useEffect, useState } from "react"

import {
  algorithmReferences,
  getAlgorithmReferenceById,
  getRelatedAlgorithmReferences,
  referenceLanguageOrder,
  type AlgorithmReference,
  type ReferenceLanguageId
} from "./reference.js"
import { type AppRoute } from "./routes.js"

type ReferenceLibraryProps = {
  route: AppRoute
  onBrowseLibrary: () => void
  onOpenReference: (algorithmId: string) => void
  onOpenReplay: (algorithmId: string) => void
}

function getAccentClass(accent: AlgorithmReference["algorithm"]["accent"]): string {
  return `accent-${accent}`
}

function getDomainLabel(domain: AlgorithmReference["algorithm"]["domain"]): string {
  return domain === "sorting" ? "Sorting systems" : "Graph pathfinding"
}

function ReferenceCatalog({
  missingAlgorithmId,
  onOpenReference,
  onOpenReplay
}: Pick<ReferenceLibraryProps, "onOpenReference" | "onOpenReplay"> & {
  missingAlgorithmId?: string
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
            <h2>Reference pages tied directly to TraceDeck algorithms</h2>
          </div>
          <p className="panel-copy">
            Every page exposes the algorithm idea, complexity profile, interview framing,
            reasoning steps, and production-ready starter implementations in four languages.
          </p>
        </div>
        {missingAlgorithmId ? (
          <div className="error-banner">
            No reference page exists for "{missingAlgorithmId}". Browse the current catalog below.
          </div>
        ) : null}
        <div className="summary-grid reference-summary-grid">
          <article className="summary-card">
            <p className="card-kicker">Algorithms</p>
            <h3>{algorithmReferences.length}</h3>
          </article>
          <article className="summary-card">
            <p className="card-kicker">Languages</p>
            <h3>{referenceLanguageOrder.map((language) => language.label).join(" / ")}</h3>
          </article>
          <article className="summary-card">
            <p className="card-kicker">Replay Link</p>
            <h3>Reference pages launch the exact replay surface for each algorithm.</h3>
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
                ? "These pages pair side-by-side complexity tradeoffs with deterministic replay-ready algorithms."
                : "These pages focus on path discovery, frontier control, and route reconstruction semantics."}
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
                    <span>Space</span>
                    <strong>{reference.complexity.space}</strong>
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
                    Open reference
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
    </div>
  )
}

function ImplementationDeck({ reference }: { reference: AlgorithmReference }) {
  const [languageId, setLanguageId] = useState<ReferenceLanguageId>("typescript")

  useEffect(() => {
    setLanguageId("typescript")
  }, [reference.algorithm.id])

  const implementation =
    reference.implementations.find((candidate) => candidate.language === languageId) ??
    reference.implementations[0]!

  return (
    <section className="panel summary-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Implementations</p>
          <h2>Multi-language starter code</h2>
        </div>
        <p className="panel-copy">
          The snippets below aim for clean interview or reference use, not framework-specific
          runtime wiring.
        </p>
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

function ReferenceDetail({
  algorithmId,
  onBrowseLibrary,
  onOpenReference,
  onOpenReplay
}: Pick<ReferenceLibraryProps, "onBrowseLibrary" | "onOpenReference" | "onOpenReplay"> & {
  algorithmId: string
}) {
  const reference = getAlgorithmReferenceById(algorithmId)

  if (!reference) {
    return (
      <ReferenceCatalog
        missingAlgorithmId={algorithmId}
        onOpenReference={onOpenReference}
        onOpenReplay={onOpenReplay}
      />
    )
  }

  const relatedReferences = getRelatedAlgorithmReferences(reference.algorithm.id)

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
            <span>Space</span>
            <strong>{reference.complexity.space}</strong>
            <p className="metric-caption">Auxiliary memory</p>
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

          <ImplementationDeck reference={reference} />
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

export function ReferenceLibrary({
  route,
  onBrowseLibrary,
  onOpenReference,
  onOpenReplay
}: ReferenceLibraryProps) {
  if (route.view === "reference-detail") {
    return (
      <ReferenceDetail
        algorithmId={route.algorithmId}
        onBrowseLibrary={onBrowseLibrary}
        onOpenReference={onOpenReference}
        onOpenReplay={onOpenReplay}
      />
    )
  }

  return (
    <ReferenceCatalog
      onOpenReference={onOpenReference}
      onOpenReplay={onOpenReplay}
      {...(route.view === "reference-index" && route.missingAlgorithmId
        ? { missingAlgorithmId: route.missingAlgorithmId }
        : {})}
    />
  )
}
