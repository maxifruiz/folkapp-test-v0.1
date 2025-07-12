import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FlyingReactionProps {
  trigger: boolean;
  type: "like" | "attend";
  startPos: { x: number; y: number } | null;
  onComplete: () => void;
}

export const FlyingReaction: React.FC<FlyingReactionProps> = ({
  trigger,
  type,
  startPos,
  onComplete,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger && startPos) setShow(true);
  }, [trigger, startPos]);

  const icon = type === "like" ? "❤️" : "✅";
  const color = type === "like" ? "#EF4444" : "#22C55E";
  const label = type === "like" ? "Like" : "¡Asistiré!";

  return (
    <AnimatePresence>
      {show && startPos && (
        <motion.div
          className="fixed z-[9999]"
          initial={{ x: startPos.x, y: startPos.y, scale: 1, opacity: 1 }}
          animate={{
            x: "50vw",
            y: "50vh",
            rotate: [0, 20, -20, 0],
            scale: [1, 1.5, 1.2],
            opacity: [1, 1, 1],
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ fontSize: 40, pointerEvents: "none" }}
          onAnimationComplete={() => setShow(false)}
        >
          <span style={{ display: "inline-block" }}>{icon}</span>

          {/* Texto al llegar al centro */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute left-1/2 top-1/2 text-3xl font-bold"
            style={{ color, transform: "translate(-50%, -50%)" }}
            onAnimationComplete={onComplete}
          >
            {label}
          </motion.div>

          {/* Confetis */}
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
              }}
              animate={{
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
                opacity: 0,
              }}
              transition={{ duration: 1, delay: 1.2 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

