import { memo } from 'react';

const MessageBubble = memo(function MessageBubble({ text }) {
  return (
    <>
      {text.split('\n').map((line, i, arr) => (
        <span key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </span>
      ))}
    </>
  );
});

export default MessageBubble;