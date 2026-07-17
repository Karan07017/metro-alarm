import { motion } from 'framer-motion';
import { TrainFront } from 'lucide-react';

export default function Loader({ label = 'Loading...', full = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
        className="w-10 h-10 rounded-xl bg-gradient-gps flex items-center justify-center shadow-glow"
      >
        <TrainFront className="w-5 h-5 text-white" />
      </motion.div>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );

  if (!full) return content;

  return <div className="min-h-screen flex items-center justify-center bg-bg">{content}</div>;
}
