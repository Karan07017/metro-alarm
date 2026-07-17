import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center py-16 px-6"
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-faint" />
        </div>
      )}
      <h3 className="font-display font-semibold text-text mb-1.5">{title}</h3>
      {description && <p className="text-sm text-muted max-w-xs mb-5">{description}</p>}
      {action}
    </motion.div>
  );
}
