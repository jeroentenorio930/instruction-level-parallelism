import React, { useState, useEffect } from 'react';
import type { InstructionRow, CellData } from './pipelineUtils';
import PipelineGrid from './PipelineGrid';

export default function HazardStallSim() {
  const [forwardingEnabled, setForwardingEnabled] = useState<boolean>(false);
  const [currentCycle, setCurrentCycle] = useState<number>(-1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const totalCycles = forwardingEnabled ? 7 : 9;

  // Sync state changes
  useEffect(() => {
    setCurrentCycle(-1);
    setIsAnimating(false);
  }, [forwardingEnabled]);

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
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAnimating, totalCycles]);

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

  // Generate grid cells based on forwarding mode
  const generateStallGridData = (cycle: number): InstructionRow[] => {
    const rows: InstructionRow[] = [];

    // Row 0: ADD R1, R2, R3 (computed at E, written at WB)
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
    rows.push({ label: 'ADD R1, R2, R3', cells: r0Cells });

    if (!forwardingEnabled) {
      // WITHOUT FORWARDING: SUB stalls 2 cycles until ADD WB stage finishes
      // Row 1: SUB R4, R1, R5 (reads R1, needs it at E)
      const r1Cells: CellData[] = [];
      for (let c = 0; c < totalCycles; c++) {
        if (c === 1) {
          r1Cells.push({ type: 'stage', label: 'F', stageName: 'F', cellCycle: c, isHighlighted: cycle === c });
        } else if (c === 2) {
          r1Cells.push({ type: 'stage', label: 'D', stageName: 'D', cellCycle: c, isHighlighted: cycle === c });
        } else if (c === 3 || c === 4) {
          r1Cells.push({ type: 'stall', label: '☁ stall', cellCycle: c, isHighlighted: cycle === c });
        } else if (c >= 5 && c < 8) {
          const stages = ['E', 'M', 'WB'] as const;
          r1Cells.push({
            type: 'stage',
            label: stages[c - 5],
            stageName: stages[c - 5],
            cellCycle: c,
            isHighlighted: cycle === c,
          });
        } else {
          r1Cells.push({ type: 'empty', label: '', cellCycle: c });
        }
      }
      rows.push({ label: 'SUB R4, R1, R5', cells: r1Cells });

      // Row 2: AND R6, R7, R8 (starts after SUB F)
      const r2Cells: CellData[] = [];
      for (let c = 0; c < totalCycles; c++) {
        if (c === 2) {
          r2Cells.push({ type: 'stage', label: 'F', stageName: 'F', cellCycle: c, isHighlighted: cycle === c });
        } else if (c === 3) {
          r2Cells.push({ type: 'stage', label: 'D', stageName: 'D', cellCycle: c, isHighlighted: cycle === c });
        } else if (c === 4 || c === 5) {
          r2Cells.push({ type: 'stall', label: '☁ stall', cellCycle: c, isHighlighted: cycle === c });
        } else if (c >= 6 && c < 9) {
          const stages = ['E', 'M', 'WB'] as const;
          r2Cells.push({
            type: 'stage',
            label: stages[c - 6],
            stageName: stages[c - 6],
            cellCycle: c,
            isHighlighted: cycle === c,
          });
        } else {
          r2Cells.push({ type: 'empty', label: '', cellCycle: c });
        }
      }
      rows.push({ label: 'AND R6, R7, R8', cells: r2Cells });

    } else {
      // WITH FORWARDING: SUB can execute immediately at t3 by getting R1 from ADD E stage
      // Row 1: SUB R4, R1, R5 (starts at t1)
      const r1Cells: CellData[] = [];
      for (let c = 0; c < totalCycles; c++) {
        if (c >= 1 && c < 6) {
          const stages = ['F', 'D', 'E', 'M', 'WB'] as const;
          r1Cells.push({
            type: 'stage',
            label: stages[c - 1],
            stageName: stages[c - 1],
            cellCycle: c,
            isHighlighted: cycle === c,
          });
        } else {
          r1Cells.push({ type: 'empty', label: '', cellCycle: c });
        }
      }
      rows.push({ label: 'SUB R4, R1, R5', cells: r1Cells });

      // Row 2: AND R6, R7, R8 (starts at t2)
      const r2Cells: CellData[] = [];
      for (let c = 0; c < totalCycles; c++) {
        if (c >= 2 && c < 7) {
          const stages = ['F', 'D', 'E', 'M', 'WB'] as const;
          r2Cells.push({
            type: 'stage',
            label: stages[c - 2],
            stageName: stages[c - 2],
            cellCycle: c,
            isHighlighted: cycle === c,
          });
        } else {
          r2Cells.push({ type: 'empty', label: '', cellCycle: c });
        }
      }
      rows.push({ label: 'AND R6, R7, R8', cells: r2Cells });
    }

    return rows;
  };

  const timeCycles = Array.from({ length: totalCycles }, (_, i) => i);
  const rows = generateStallGridData(currentCycle);

  // Status explanation message
  let explanation = '';
  if (!forwardingEnabled) {
    if (currentCycle === -1) {
      explanation = 'Enable Forwarding to see bypass circuits, or step forward to watch the pipeline stall.';
    } else if (currentCycle === 0) {
      explanation = 't0: ADD starts F stage. R1 destination register is parsed.';
    } else if (currentCycle === 1) {
      explanation = 't1: ADD decodes. SUB is fetched (F stage).';
    } else if (currentCycle === 2) {
      explanation = 't2: ADD executes. SUB is decoded, detecting dependency on R1. R1 value is NOT yet written back!';
    } else if (currentCycle === 3) {
      explanation = 't3: Hazard! SUB must wait for R1. A stall bubble (nop) is injected. ADD moves to Memory stage.';
    } else if (currentCycle === 4) {
      explanation = 't4: SUB must stall again as ADD writes R1 back to the register file (WB stage).';
    } else if (currentCycle === 5) {
      explanation = 't5: R1 is finally updated! SUB can now execute (E stage) with the correct value.';
    } else {
      explanation = `t${currentCycle}: Pipeline resumes. SUB progresses down the pipeline.`;
    }
  } else {
    if (currentCycle === -1) {
      explanation = 'Bypass lines are active. Step forward to see data forwarding in action.';
    } else if (currentCycle === 2) {
      explanation = 't2: ADD finishes executing. The result for R1 is ready inside the ALU output register.';
    } else if (currentCycle === 3) {
      explanation = 't3: Forwarding! ALU output from ADD is routed directly to SUB execute stage input. No stall!';
    } else {
      explanation = `t${currentCycle}: Overlapped execution runs at 100% efficiency.`;
    }
  }

  // Draw forwarding SVG path when forwarding is enabled at cycle 3
  const showForwardingLine = forwardingEnabled && currentCycle === 3;

  const renderSVGOverlay = () => {
    if (!showForwardingLine) return null;

    // ADD Execute is in row 0, t2. (Column 2)
    // SUB Execute is in row 1, t3. (Column 3)
    // Left label width = 80px + 6px spacing = 86px
    // Col 2 center = 86 + 2 * 58 + 26 = 228px. Right edge = 228 + 26 = 254px.
    // Row 0 center = Header (40px) + 0.5 * 50 = 65px
    // Col 3 center = 86 + 3 * 58 + 26 = 286px. Left edge = 286 - 26 = 260px.
    // Row 1 center = Header + 1.5 * 50 = 115px

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
            id="forward-arrow"
            markerWidth="10"
            markerHeight="10"
            refX="6"
            refY="5"
            orient="auto"
          >
            <path d="M0,1 L10,5 L0,9 F" className="ps-forward-arrow" />
          </marker>
        </defs>
        {/* Draw routing line from ADD E stage to SUB E stage */}
        <path
          d="M 230,86 L 230,100 Q 230,125 270,125 L 270,135"
          fill="none"
          stroke="#55FF55"
          strokeWidth="3.5"
          className="ps-forward-line"
          markerEnd="url(#forward-arrow)"
        />
      </svg>
    );
  };

  return (
    <div className="pipeline-sim">
      <div className="ps-header">
        <h3 className="ps-title">Data Hazard & Stall vs. Forwarding</h3>
        <div className="ps-controls">
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
            <label className="ps-toggle">
              <span className={`ps-toggle__label ${forwardingEnabled ? 'ps-toggle__label--on' : ''}`}>
                Data Forwarding
              </span>
              <div
                className={`ps-toggle__track ${forwardingEnabled ? 'ps-toggle__track--on' : ''}`}
                onClick={() => setForwardingEnabled(!forwardingEnabled)}
              >
                <div className="ps-toggle__thumb" />
              </div>
            </label>
          </div>

          <button className="ps-btn" onClick={togglePlay}>
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

      <div className="ps-grid-wrapper" style={{ position: 'relative' }}>
        <PipelineGrid
          timeCycles={timeCycles}
          rows={rows}
          activeCycle={currentCycle}
          overlays={renderSVGOverlay()}
        />

        {showForwardingLine && (
          <div
            className="ps-annotation"
            style={{
              top: '95px',
              left: '265px',
              border: '1px solid var(--ps-green)',
              background: '#03071E',
              color: '#55FF55',
              boxShadow: '0 0 10px rgba(85, 255, 85, 0.4)',
            }}
          >
            Bypass Active: E → E Forwarding
          </div>
        )}

        {!forwardingEnabled && (currentCycle === 3 || currentCycle === 4) && (
          <div
            className="ps-annotation"
            style={{
              top: '90px',
              left: '235px',
              border: '1px solid var(--ps-red)',
              background: '#03071E',
              color: '#FF5555',
              boxShadow: '0 0 10px rgba(255, 85, 85, 0.4)',
            }}
          >
            Stalled waiting for R1 writeback
          </div>
        )}
      </div>

      <p style={{ fontSize: '0.85rem', color: '#CCCCCC', marginTop: '1rem', minHeight: '2.5rem' }}>
        <strong>Description:</strong> {explanation}
      </p>

      <div className="ps-stats">
        <div className="ps-stat">
          <span className="ps-stat__label">Total Execution Time</span>
          <span className="ps-stat__value ps-stat__value--highlight">
            {totalCycles} Cycles
          </span>
        </div>
        <div className="ps-stat">
          <span className="ps-stat__label">Total Stalls</span>
          <span className={`ps-stat__value ${!forwardingEnabled ? 'ps-stat__value--danger' : 'ps-stat__value--cyan'}`}>
            {forwardingEnabled ? '0 stalls' : '2 cycles stalled'}
          </span>
        </div>
        <div className="ps-stat">
          <span className="ps-stat__label">Hardware Cost</span>
          <span className="ps-stat__value">
            {forwardingEnabled ? 'Bypass muxes + pathways' : 'Interlocking controller only'}
          </span>
        </div>
        <div className="ps-stat" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <span className={`ps-badge ${forwardingEnabled ? '' : 'ps-badge--warning'}`}>
            {forwardingEnabled ? '⚡ Optimized' : '🐢 Unoptimized'}
          </span>
        </div>
      </div>
    </div>
  );
}
