import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
}

interface Link {
  source: number;
  target: number;
}

export function NeuralNetworkLink() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    // Create a simple layered neural network structure
    const layers = [3, 5, 4, 2];
    const newNodes: Node[] = [];
    const newLinks: Link[] = [];
    let idCounter = 0;

    const layerWidth = 80;
    const height = 160;

    layers.forEach((count, layerIndex) => {
      const x = 40 + layerIndex * layerWidth;
      const spacing = height / (count + 1);
      
      for (let i = 0; i < count; i++) {
        const y = spacing * (i + 1);
        newNodes.push({ id: idCounter++, x, y });
      }
    });

    // Create links between adjacent layers
    let prevLayerStart = 0;
    for (let l = 0; l < layers.length - 1; l++) {
      const currentLayerCount = layers[l];
      const nextLayerCount = layers[l + 1];
      const nextLayerStart = prevLayerStart + currentLayerCount;

      for (let i = 0; i < currentLayerCount; i++) {
        for (let j = 0; j < nextLayerCount; j++) {
          newLinks.push({
            source: prevLayerStart + i,
            target: nextLayerStart + j,
          });
        }
      }
      prevLayerStart = nextLayerStart;
    }

    setNodes(newNodes);
    setLinks(newLinks);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#f9f9f9] rounded-lg overflow-hidden relative">
      <svg width="100%" height="100%" viewBox="0 0 320 180" className="opacity-80">
        {/* Links */}
        {links.map((link, i) => {
          const source = nodes[link.source];
          const target = nodes[link.target];
          if (!source || !target) return null;
          return (
            <motion.line
              key={`link-${i}`}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="#2563eb"
              strokeWidth="0.5"
              initial={{ opacity: 0.1 }}
              animate={{ 
                opacity: [0.1, 0.3, 0.1],
                strokeWidth: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2 + Math.random() * 2, 
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <motion.circle
            key={`node-${node.id}`}
            cx={node.x}
            cy={node.y}
            r="3"
            fill="#2563eb"
            initial={{ scale: 1 }}
            animate={{ 
              scale: [1, 1.2, 1],
              fill: ['#2563eb', '#60a5fa', '#2563eb']
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}

        {/* Data flow pulses */}
        {links.filter(() => Math.random() > 0.8).map((link, i) => {
          const source = nodes[link.source];
          const target = nodes[link.target];
          if (!source || !target) return null;
          return (
            <motion.circle
              key={`pulse-${i}`}
              r="1.5"
              fill="#fff"
              initial={{ cx: source.x, cy: source.y, opacity: 0 }}
              animate={{ 
                cx: target.x, 
                cy: target.y,
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
            />
          );
        })}
      </svg>
      
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Neural Link Active</span>
      </div>
    </div>
  );
}
