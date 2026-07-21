import React, { useState } from 'react';

export default function Decode() {
    const [step, setStep] = useState(0);

    function meaningOfHex()
    {
        setStep(3);
    };

    function splitUp()
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
        setTimeout(splitUp, 1500);
        setTimeout(meaningOfHex, 3000);
        setTimeout(stopAnimation, 10000);
    };

    return (
        <div className="pipeline-sim">
            <div className="ps-header">
                <h3 className="ps-title">
                    Cycle 2: Decode (D)
                </h3>
                
                <button className="ps-btn ps-btn--success" onClick={() => playAnimation()}>
                    Play
                </button>
            </div>

            {/* WHO ARE YOU? Explanations */}
            {step == 3 && (
                <div className="ps-explanation-row">
                    <div className="ps-explanation-box" style={{ borderColor: 'var(--ps-yellow)' }}>
                        <div className="ps-explanation-label" style={{ color: 'var(--ps-yellow)' }}>
                            48
                        </div>
                        <span className="ps-explanation-text">We are accessing 64 bit operands</span>
                    </div>
                    <div className="ps-explanation-box" style={{ borderColor: 'var(--ps-cyan)' }}>
                        <div className="ps-explanation-label" style={{ color: 'var(--ps-cyan)' }}>
                            8B
                        </div>
                        <span className="ps-explanation-text">Moving from a 64 bit register or memory to a 64 bit register</span>
                    </div>
                    <div className="ps-explanation-box" style={{ borderColor: 'var(--ps-green)' }}>
                        <div className="ps-explanation-label" style={{ color: 'var(--ps-green)' }}>
                            05
                        </div>
                        <span className="ps-explanation-text">The destination is RAX, find var1 based on how far it is from RIP</span>
                    </div>
                    <div className="ps-explanation-box" style={{ borderColor: 'var(--ps-red)' }}>
                        <div className="ps-explanation-label" style={{ color: 'var(--ps-red)' }}>
                            7F 00 00 00
                        </div>
                        <span className="ps-explanation-text">It is 127 addresses away from RIP</span>
                    </div>
                </div>
            )}
            

            {/* WHO ARE YOU? CPU*/}
            <div className='ps-cpu-container'>
                <div className='ps-label'>
                    CPU
                </div>

                {/* WHO ARE YOU? Control Unit */}
                <div className='ps-control-unit'>
                    <div className='ps-label'>
                        Control Unit
                    </div>

                    {(step == 0 || step == 1) && (
                        <div className="ps-badge">
                            0x48_8B05_7F00_0000
                        </div>
                    )}

                    {(step == 2 || step == 3) && (
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                            <div className="ps-badge" style={{ color: 'var(--ps-yellow)', borderColor: 'var(--ps-yellow)' }}>
                                48
                            </div>

                            <div className="ps-badge" style={{ color: 'var(--ps-cyan)', borderColor: 'var(--ps-cyan)' }}>
                                8B
                            </div>

                            <div className="ps-badge" style={{ color: 'var(--ps-green)', borderColor: 'var(--ps-green)' }}>
                                05
                            </div>

                            <div className="ps-badge" style={{ color: 'var(--ps-red)', borderColor: 'var(--ps-red)' }}>
                                7F 00 00 00
                            </div>
                        </div>
                    )}
                    
                </div>

                {/* Register File Row */}
                <div style={{ display: 'flex' }}>
                    
                    {/* WHO ARE YOU? Register File */}
                    <div className='ps-register-file'>
                        <div className='ps-label'>
                            Register File
                        </div>

                        <div className="ps-stat__value ps-stat__value--cyan" style={{ fontSize: '1.3rem', lineHeight: '1.5' }}>
                            RAX: 0x----_----_----_----<br />
                            RBX: 0x----_----_----_----<br />
                            RCX: 0x----_----_----_----<br />
                            RDX: 0x----_----_----_----
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}