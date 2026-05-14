import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../../store';
import styles from './ExecPanel.module.css';

const FAKE_RESPONSES: Record<string, string> = {
  'ls': 'app  bin  config  etc  lib  tmp  var',
  'ls -la': 'total 48\ndrwxr-xr-x  8 root root 4096 Jan 15 10:00 .\ndrwxr-xr-x 20 root root 4096 Jan 15 10:00 ..\ndrwxr-xr-x  2 root root 4096 Jan 15 10:00 app\n-rwxr-xr-x  1 root root 8192 Jan 15 10:00 entrypoint.sh',
  'pwd': '/app',
  'whoami': 'root',
  'hostname': 'my-pod-7d4b9f-abc12',
  'env': 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nHOME=/root\nKUBERNETES_SERVICE_HOST=10.96.0.1\nKUBERNETES_SERVICE_PORT=443',
  'cat /etc/os-release': 'NAME="Alpine Linux"\nID=alpine\nVERSION_ID=3.18.4',
  'ps aux': 'PID   USER     TIME  COMMAND\n    1 root      0:01 /app/server\n   42 root      0:00 sh',
  'free -h': '              total        used        free\nMem:            256M        128M        128M\nSwap:             0B          0B          0B',
  'df -h': 'Filesystem      Size  Used Avail Use% Mounted on\noverlay          80G   12G   68G  15% /\ntmpfs           128M     0  128M   0% /tmp',
  'exit': '__EXIT__',
};

interface Line {
  type: 'input' | 'output';
  text: string;
}

export function ExecPanel() {
  const pods = useStore((s) => s.pods);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const setActivePanel = useStore((s) => s.setActivePanel);

  const pod = pods[selectedIndex];
  const containerName = pod?.containers[0]?.name || 'container';
  const podName = pod?.name || 'pod';

  const [lines, setLines] = useState<Line[]>([
    { type: 'output', text: `Connecting to ${podName}/${containerName}...` },
    { type: 'output', text: 'If you don\'t see a command prompt, try pressing enter.' },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    bottomRef.current?.scrollIntoView();
  }, [lines]);

  const submit = () => {
    const cmd = input.trim();
    if (!cmd) return;
    const newLines: Line[] = [...lines, { type: 'input', text: `$ ${cmd}` }];
    const response = FAKE_RESPONSES[cmd];
    if (response === '__EXIT__') {
      setActivePanel(null);
      return;
    }
    if (response !== undefined) {
      newLines.push({ type: 'output', text: response });
    } else {
      newLines.push({ type: 'output', text: `sh: ${cmd}: not found` });
    }
    setLines(newLines);
    setInput('');
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Shell — {podName} / {containerName}</span>
        <button className={styles.close} onClick={() => setActivePanel(null)}>✕ Esc</button>
      </div>
      <div className={styles.terminal} onClick={() => inputRef.current?.focus()}>
        {lines.map((l, i) => (
          <div key={i} className={l.type === 'input' ? styles.inputLine : styles.outputLine}>
            {l.text}
          </div>
        ))}
        <div className={styles.promptRow}>
          <span className={styles.prompt}>$ </span>
          <input
            ref={inputRef}
            className={styles.promptInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
              if (e.key === 'Escape') setActivePanel(null);
              e.stopPropagation();
            }}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
