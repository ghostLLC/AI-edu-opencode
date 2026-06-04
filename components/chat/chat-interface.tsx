/**
 * Shared streaming chat interface for the LEARN and PRACTICE stages.
 *
 * Uses Vercel AI SDK's useChat (handles SSE data stream protocol).
 * The API route /api/chat reads custom body fields (planId, stage, nodeId)
 * from the request and passes them to the orchestrator.
 */

'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatInterfaceProps {
  planId: string;
  stage: 'learn' | 'practice';
  nodeId: string;
  nodeTitle: string;
  emptyHint: string;
  inputPlaceholder: string;
  submitLabel: string;
  submittingLabel: string;
  initialMessages?: ChatMessage[];
  onMarkComplete?: () => void;
  completeLabel?: string;
  completeConfirmMessage?: string;
}

export function ChatInterface(props: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, status, error, stop, reload } =
    useChat({
      api: '/api/chat',
      body: {
        planId: props.planId,
        stage: props.stage,
        nodeId: props.nodeId,
      },
      initialMessages: props.initialMessages,
    });

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const isStreaming = status === 'streaming' || status === 'submitted';

  return (
    <div className="flex h-[calc(100vh-220px)] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto rounded-md border bg-muted/30 p-4">
        {messages.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">{props.emptyHint}</div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
            >
              <div
                className={
                  m.role === 'user'
                    ? 'max-w-[80%] rounded-lg bg-primary px-4 py-2 text-primary-foreground'
                    : 'max-w-[80%] whitespace-pre-wrap rounded-lg bg-background px-4 py-2 shadow-sm'
                }
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {status === 'submitted' && (
          <div className="text-sm text-muted-foreground">...</div>
        )}
        {error && (
          <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error.message}{' '}
            <button
              type="button"
              onClick={() => reload()}
              className="ml-2 underline"
            >
              Retry
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-3 space-y-2">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder={props.inputPlaceholder}
          rows={3}
          disabled={isStreaming}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
            }
          }}
        />
        <div className="flex justify-between gap-2">
          <div>
            {props.onMarkComplete && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (
                    props.completeConfirmMessage &&
                    !window.confirm(props.completeConfirmMessage)
                  ) {
                    return;
                  }
                  props.onMarkComplete?.();
                }}
                disabled={messages.length === 0}
              >
                {props.completeLabel ?? 'Mark complete'}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {isStreaming && (
              <Button type="button" variant="outline" onClick={() => stop()}>
                Stop
              </Button>
            )}
            <Button type="submit" disabled={isStreaming || !input.trim()}>
              {isStreaming ? props.submittingLabel : props.submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
