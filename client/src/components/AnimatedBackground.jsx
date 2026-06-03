import React from "react";

const particles = [
  { type: "dot", top: "12%", left: "8%", animation: "particleFloat1", duration: "6s", delay: "0s" },
  { type: "circle", top: "25%", left: "85%", animation: "particleFloat2", duration: "8s", delay: "1s" },
  { type: "glow", top: "65%", left: "15%", animation: "particleFloat3", duration: "7s", delay: "0.5s" },
  { type: "dot", top: "45%", left: "75%", animation: "particleFloat1", duration: "9s", delay: "2s" },
  { type: "circle", top: "80%", left: "60%", animation: "particleFloat2", duration: "7s", delay: "1.5s" },
  { type: "glow", top: "15%", left: "50%", animation: "particleFloat3", duration: "8s", delay: "0.8s" },
  { type: "dot", top: "70%", left: "35%", animation: "particleFloat1", duration: "10s", delay: "3s" },
  { type: "circle", top: "35%", left: "25%", animation: "particleFloat2", duration: "6s", delay: "2.5s" },
  { type: "glow", top: "55%", left: "90%", animation: "particleFloat1", duration: "9s", delay: "1.2s" },
  { type: "dot", top: "90%", left: "45%", animation: "particleFloat3", duration: "7s", delay: "0.3s" },
  { type: "dot", top: "5%", left: "65%", animation: "particleFloat2", duration: "11s", delay: "4s" },
  { type: "circle", top: "50%", left: "5%", animation: "particleFloat3", duration: "8s", delay: "3.5s" },
];

export default function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="blob blob-4" />
      {particles.map((p, i) => (
        <div
          key={i}
          className={`particle particle-${p.type}`}
          style={{
            top: p.top,
            left: p.left,
            animation: `${p.animation} ${p.duration} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
