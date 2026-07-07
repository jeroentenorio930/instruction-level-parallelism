import React, { useState, useEffect } from 'react';
import type { InstructionRow, CellData } from './pipelineUtils';
import PipelineGrid from './PipelineGrid';

export default function HazardFlushSim() {
  const [currentCycle, setCurrentCycle] = useState<number>(-1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const totalCycles = 9;

  // Handle animation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnimating) {
      timer = setInterval(() => {
        setCurrentCycle((prev) => {
          if (prev >= totalCycles - 1) {
            setIsAnimating(false);
            return -1;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isAnimating]);

  const togglePlay = () => {
    if (currentCycle >= totalCycles - 1) {
      setCurrentCycle(0);
      setIsAnimating(true);
    } else {
      if (currentCycle === -1) {
        setCurrentCycle(0);
      }
      setIsAnimating(!isAnimating);
    }
  };

  const handleReset = () => {
    setCurrentCycle(-1);
    setIsAnimating(false);
  };

  const handleStepPrev = () => {
    setIsAnimating(false);
    setCurrentCycle((prev) => (prev > -1 ? prev - 1 : -1));
  };

  const handleStepNext = () => {
    setIsAnimating(false);
    setCurrentCycle((prev) => (prev < totalCycles - 1 ? prev + 1 : prev));
  };

  // Define instruction definitions for this branch hazard scenario
  // Row 0: Instruction 1 (Branch)
  // Row 1: Instruction 2 (Wrong Path 1)
  // Row 2: Instruction 3 (Wrong Path 2)
  // Row 3: Instruction 4 (Wrong Path 3)
  // Row 4: Instruction 5 (Correct Path 1)
  const generateFlushGridData = (cycle: number): InstructionRow[] => {
    const rows: InstructionRow[] = [];

    // Row 0: Branch Instruction
    const r0Cells: CellData[] = [];
    for (let c = 0; c < totalCycles; c++) {
      if (c >= 0 && c < 5) {
        const stages = ['F', 'D', 'E', 'M', 'WB'] as const;
        r0Cells.push({
          type: 'stage',
          label: stages[c],
          stageName: stages[c],
          cellCycle: c,
          isHighlighted: cycle === c,
        });
      } else {
        r0Cells.push({ type: 'empty', label: '', cellCycle: c });
      }
    }
    rows.push({ label: 'BEQ (Branch)', cells: r0Cells });

    // Row 1: Wrong Path 1 (Starts at t1)
    const r1Cells: CellData[] = [];
    for (let c = 0; c < totalCycles; c++) {
      if (c >= 1 && c < 6) {
        const stages = ['F', 'D', 'E', 'M', 'WB'] as const;
        const isFlushed = cycle >= 4 && c >= 4;
        r1Cells.push({
          type: 'stage',
          label: isFlushed ? 'nop' : stages[c - 1],
          stageName: isFlushed ? undefined : stages[c - 1],
          cellCycle: c,
          isFaded: isFlushed || cycle === 3,
          isFlushing: cycle === 4 && c >= 4,
          isHighlighted: cycle === c && !isFlushed,
        });
      } else {
        r1Cells.push({ type: 'empty', label: '', cellCycle: c });
      }
    }
    rows.push({ label: 'ADD (Wrong)', cells: r1Cells });

    // Row 2: Wrong Path 2 (Starts at t2)
    const r2Cells: CellData[] = [];
    for (let c = 0; c < totalCycles; c++) {
      if (c >= 2 && c < 7) {
        const stages = ['F', 'D', 'E', 'M', 'WB'] as const;
        const isFlushed = cycle >= 4 && c >= 4;
        r2Cells.push({
          type: 'stage',
          label: isFlushed ? 'nop' : stages[c - 2],
          stageName: isFlushed ? undefined : stages[c - 2],
          cellCycle: c,
          isFaded: isFlushed || cycle === 3,
          isFlushing: cycle === 4 && c >= 4,
          isHighlighted: cycle === c && !isFlushed,
        });
      } else {
        r2Cells.push({ type: 'empty', label: '', cellCycle: c });
      }
    }
    rows.push({ label: 'SUB (Wrong)', cells: r2Cells });

    // Row 3: Wrong Path 3 (Starts at t3)
    const r3Cells: CellData[] = [];
    for (let c = 0; c < totalCycles; c++) {
      if (c >= 3 && c < 8) {
        const stages = ['F', 'D', 'E', 'M', 'WB'] as const;
        const isFlushed = cycle >= 4 && c >= 4;
        r3Cells.push({
          type: 'stage',
          label: isFlushed ? 'nop' : stages[c - 3],
          stageName: isFlushed ? undefined : stages[c - 3],
          cellCycle: c,
          isFaded: isFlushed || cycle === 3,
          isFlushing: cycle === 4 && c >= 4,
          isHighlighted: cycle === c && !isFlushed,
        });
      } else {
        r3Cells.push({ type: 'empty', label: '', cellCycle: c });
      }
    }
    rows.push({ label: 'AND (Wrong)', cells: r3Cells });

    // Row 4: Correct Path 1 (Starts at t4 after flush)
    const r4Cells: CellData[] = [];
    for (let c = 0; c < totalCycles; c++) {
      if (cycle >= 4 && c >= 4 && c < 9) {
        const stages = ['F', 'D', 'E', 'M', 'WB'] as const;
        r4Cells.push({
          type: 'stage',
          label: stages[c - 4],
          stageName: stages[c - 4],
          cellCycle: c,
          isHighlighted: cycle === c,
        });
      } else {
        r4Cells.push({ type: 'empty', label: '', cellCycle: c });
      }
    }
    rows.push({ label: 'OR (Correct)', cells: r4Cells });

    return rows;
  }

  const timeCycles = Array.from({ length: totalCycles }, (_, i) => i);
  const rows = generateFlushGridData(currentCycle);

  // Status message based on current cycle
  let explanation = 'Press Play or Step Forward to trace the branch hazard scenario.';
  if (currentCycle === 0) {
    explanation = 'Cycle 1 (t0): Branch instruction (BEQ) is fetched (F stage).';
  } else if (currentCycle === 1) {
    explanation = 'Cycle 2 (t1): BEQ is decoded. The hardware predicts branch taken and speculatively fetches ADD from wrong path.';
  } else if (currentCycle === 2) {
    explanation = 'Cycle 3 (t2): BEQ executes. ADD decoded, and a second wrong-path instruction (SUB) is fetched.';
  } else if (currentCycle === 3) {
    explanation = 'Cycle 4 (t3): BEQ resolves condition in Memory (M). A branch misprediction is detected! The pipeline must be flushed.';
  } else if (currentCycle === 4) {
    explanation = 'Cycle 5 (t4): Flush occurs! The wrong-path instructions (ADD, SUB, AND) are converted to NOPs. Correct instruction (OR) is fetched.';
  } else if (currentCycle >= 5) {
    explanation = `Cycle ${currentCycle + 1} (t${currentCycle}): The correct instruction path (OR) proceeds down the pipeline.`;
  }

  // Draw overlay arrow for cycle 3 & 4 (flush detection & redirection)
  const showOverlay = currentCycle === 3 || currentCycle === 4;

  const renderSVGOverlay = () => {
    if (!showOverlay) return null;

    // Fixed absolute pixel positioning matching table cells:
    // Left offset = 80px (label width) + 6px (spacing) = 86px
    // Column 3 start = 86 + 3 * 58 = 260px. Center of t3 = 260 + 26 = 286px.
    // Row 0 center = Header (approx 40px) + 0.5 * 50 = 65px
    // Row 4 start = Header + 4 * 50 = 240px. Top of Row 4 = 240px.
    // Column 4 start = 86 + 4 * 58 = 318px. Center of t4 = 318 + 26 = 344px.

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <defs>
          <marker
            id="flush-arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="6"
            refY="5"
            orient="auto-start-reverse"
          >
            <path d="M0,1 L10,5 L0,9 F" className="ps-flush-arrowhead" />
          </marker>
        </defs>
        {/* Draw diagonal arrow from BEQ (M stage at t3) to OR (F stage at t4) */}
        <path
          d="M 286,75 Q 300,120 344,242"
          fill="none"
          stroke="#FF5555"
          strokeWidth="3"
          strokeDasharray="5,3"
          markerEnd="url(#flush-arrowhead)"
          className="ps-flush-arrow"
          style={{ animation: 'ps-dashDraw 1.2s linear infinite' }}
        />
      </svg>
    );
  };

  return (
    <div className="pipeline-sim">
      <div className="ps-header">
        <h3 className="ps-title">Branch Misprediction & Pipeline Flush</h3>
        <div className="ps-controls">
          <button className="ps-btn ps-btn--danger" onClick={togglePlay}>
            {isAnimating ? '⏸ Pause' : '▶ Play'}
          </button>
          <button className="ps-btn" onClick={handleStepPrev} disabled={currentCycle <= -1}>
            ◀ Step Back
          </button>
          <button className="ps-btn" onClick={handleStepNext} disabled={currentCycle >= totalCycles - 1}>
            Step Forward ▶
          </button>
          <button className="ps-btn ps-btn--danger" onClick={handleReset}>
            ↺ Reset
          </button>
        </div>
      </div>

      <div className="ps-steps">
        <div className={`ps-step-dot ${currentCycle >= 0 ? 'ps-step-dot--done' : ''}`} />
        <div className={`ps-step-dot ${currentCycle >= 3 ? 'ps-step-dot--active' : ''}`} />
        <div className={`ps-step-dot ${currentCycle >= 4 ? 'ps-step-dot--done' : ''}`} />
        <span className="ps-step-label">
          {currentCycle === 3 ? '🚨 MISPREDICTION DETECTED' : currentCycle === 4 ? '🌊 FLUSH ACTIVE' : 'MONITORING'}
        </span>
      </div>

      <div className="ps-grid-wrapper" style={{ position: 'relative' }}>
        <PipelineGrid
          timeCycles={timeCycles}
          rows={rows}
          activeCycle={currentCycle}
          overlays={renderSVGOverlay()}
        />

        {currentCycle === 3 && (
          <div
            className="ps-annotation"
            style={{
              top: '80px',
              left: '260px',
              border: '1px solid var(--ps-red)',
              background: '#03071E',
              color: '#FF5555',
              boxShadow: '0 0 10px rgba(255, 85, 85, 0.4)',
            }}
          >
            Branch Misprediction!
          </div>
        )}

        {currentCycle === 4 && (
          <div
            className="ps-annotation"
            style={{
              top: '120px',
              left: '180px',
              border: '1px solid var(--ps-cyan)',
              background: '#03071E',
              color: '#55FFFF',
              boxShadow: '0 0 10px rgba(85, 255, 255, 0.4)',
            }}
          >
            Pipeline Flushed (NOPs injected)
          </div>
        )}
      </div>

      <p style={{ fontSize: '0.85rem', color: '#CCCCCC', marginTop: '1rem', minHeight: '2.5rem' }}>
        <strong>Description:</strong> {explanation}
      </p>

      <div className="ps-stats">
        <div className="ps-stat">
          <span className="ps-stat__label">Scenario Status</span>
          <span className="ps-stat__value ps-stat__value--cyan">
            {currentCycle === -1 ? 'INITIAL' : currentCycle >= 4 ? 'FLUSH COMPLETED' : 'SPECULATIVE FETCH'}
          </span>
        </div>
        <div className="ps-stat">
          <span className="ps-stat__label">Flush Penalty</span>
          <span className="ps-stat__value ps-stat__value--danger">
            {currentCycle >= 4 ? '3 Cycles Wasted' : 'Checking...'}
          </span>
        </div>
        <div className="ps-stat">
          <span className="ps-stat__label">Resulting NOPs</span>
          <span className="ps-stat__value ps-stat__value--highlight">
            {currentCycle >= 4 ? '3 instructions flushed' : '0'}
          </span>
        </div>
        <div className="ps-stat" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <span className={`ps-badge ${currentCycle >= 3 && currentCycle <= 4 ? 'ps-badge--warning' : ''}`}>
            {currentCycle === 3 ? '⚠️ Hazard Triggered' : 'Branch Hazard Demo'}
          </span>
        </div>
      </div>
    </div>
  );
}
