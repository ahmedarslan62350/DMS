'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, User, Clock } from 'lucide-react';

interface Comment {
  id: number;
  user: string;
  text: string;
  date: string;
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
}

const mockComments: Comment[] = [
  { id: 1, user: 'Admin', text: 'Initial setup completed. All servers are live.', date: '2024-03-01 10:00 AM' },
  { id: 2, user: 'Sarah K.', text: 'Client requested additional server for backup.', date: '2024-03-04 02:30 PM' },
  { id: 3, user: 'Mike R.', text: 'Added 1 server. Updated charges to $1,200.', date: '2024-03-04 04:15 PM' },
];

export function CommentsModal({ isOpen, onClose, companyName }: Readonly<CommentsModalProps>) {
  const [newComment, setNewComment] = React.useState('');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl z-[60] overflow-hidden"
          >
            <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Comments</h2>
                <p className="text-sm text-black/40 dark:text-white/40">{companyName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 h-[400px] overflow-y-auto space-y-6 custom-scrollbar">
              {mockComments.map((comment, i) => (
                <div key={comment.id} className="relative pl-8">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-black/5 dark:bg-white/10" />
                  <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-black dark:bg-white" />
                  
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold flex items-center gap-1">
                      <User className="w-3 h-3" /> {comment.user}
                    </span>
                    <span className="text-[10px] text-black/40 dark:text-white/40 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {comment.date}
                    </span>
                  </div>
                  <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-2xl border border-black/5 dark:border-white/5">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-6 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/10">
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type your comment..."
                  className="w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl p-4 pr-12 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all resize-none h-24"
                />
                <button
                  disabled={!newComment.trim()}
                  className="absolute right-3 bottom-3 p-2 rounded-xl bg-black dark:bg-white text-white dark:text-black disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
