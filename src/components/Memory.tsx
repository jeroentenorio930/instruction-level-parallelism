import React, { useState } from 'react';

export default function Memory() {
    const [step, setStep] = useState(0);

    function var1InCPU()
    {
        setStep(3);
    };

    function showLine()
    {
        setStep(2);
    };

    function stopAnimation()
    {
        setStep(0);
    };

    function playAnimation()
    {
        setStep(1);
        setTimeout(showLine, 2000);
        setTimeout(var1InCPU, 4000);
        setTimeout(stopAnimation, 6000);
    };

    return (
        <div className="pipeline-sim">
            <div className="ps-header">
                <h3 className="ps-title">
                    Cycle 4: Memory (M)
                </h3>
                
                <button className="ps-btn ps-btn--success" onClick={() => playAnimation()}>
                    Play
                </button>
            </div>

            <div className='ps-main-container'>
                
                {/* WHO ARE YOU??? CPU Rectangle */}
                <div className='ps-box ps-cpu'>
                    <div className='ps-label'>
                        CPU
                    </div>

                    <div className='ps-row'>

                        {step == 3 && (
                          <span style={{ color: 'var(--ps-green)' }} >
                            0x0000_0000_0000_0004
                          </span>
                        )}

                    </div>
                </div>

                {/* WHO ARE YOU??? Path Animation */}
                <div className='ps-path'>

                    {step == 2 && (
                        <svg className='ps-svg'>
                            <line className="ps-exec-line" x1="0" y1="10" x2="100%" y2="10" />

                            <svg x="0" y="10" style={{ overflow: 'visible' }}>
                                <polygon className="ps-exec-arrow" points="10,-5 0,0 10,5" />
                            </svg>
                        </svg>
                    )}

                </div>

                {/* WHO ARE YOU??? Memory Rectangle */}
                <div className='ps-box ps-mem'>
                    <div className='ps-label'>
                        Memory
                    </div>

                    {/* WHO ARE YOU? Top Row */}
                    <div className='ps-row'>
                        <span>
                          instruction
                        </span>
                        
                        <span>
                            0x488B_45??_????_????
                        </span>
                    </div>

                    {/* WHO ARE YOU? Bottom Row */}
                    <div className='ps-row'>
                        <span>
                          var1
                        </span>

                        {(step == 1 || step == 2) && (
                            <span style={{ color: 'var(--ps-green)' }} >
                                0x0000_0000_0000_0004
                            </span>
                        )}

                        {(step == 0 || step == 3) && (
                            <span>
                                0x0000_0000_0000_0004
                            </span>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}