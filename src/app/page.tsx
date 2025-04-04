"use client";
import { useState, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import styles from "./page.module.css";

interface OutputItem {
  type: 'error' | 'success';
  content: string;
}

export default function Home() {
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState("javascript");
  const [width, setWidth] = useState(300);
  const [output, setOutput] = useState<OutputItem[]>([]);
  const [height, setHeight] = useState(800); // Default height

  const languages = ["javascript", "python"];

  // Set the actual height after component mounts
  useEffect(() => {
    setHeight(window.innerHeight);
  }, []);

  const handleResize = useCallback((e: any, { size }: { size: { width: number } }) => {
    setWidth(size.width);
  }, []);

  // Function to safely evaluate JavaScript code
  const runJavaScript = (code: string) => {
    try {
      // Create a new function to run the code with console.log capture
      const logs: string[] = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };

      // Wrap in async function to allow for async code
      const asyncEval = new Function(`
        return (async () => {
          try {
            ${code}
          } catch (error) {
            throw error;
          }
        })();
      `);

      asyncEval()
        .then((result) => {
          if (result !== undefined) {
            logs.push(`Return value: ${result}`);
          }
          if (logs.length > 0) {
            setOutput(prev => [...prev, { type: 'success', content: logs.join('\n') }]);
          }
        })
        .catch((error) => {
          setOutput(prev => [...prev, { type: 'error', content: error.toString() }]);
        })
        .finally(() => {
          console.log = originalConsoleLog;
        });
    } catch (error) {
      setOutput(prev => [...prev, { type: 'error', content: error.toString() }]);
    }
  };

  // Function to handle Python code (mock)
  const runPython = (code: string) => {
    setOutput(prev => [...prev, {
      type: 'error',
      content: 'Python execution requires a backend service. This is just a demo.'
    }]);
  };

  const handleRunCode = () => {
    if (language === 'javascript') {
      runJavaScript(code);
    } else if (language === 'python') {
      runPython(code);
    }
  };

  const clearOutput = () => {
    setOutput([]);
  };

  return (
    <div className={styles.container}>
      <div style={{ position: 'relative', height: '100%' }}>
        <ResizableBox
          width={width}
          height={height}
          onResize={handleResize}
          minConstraints={[200, height]}
          maxConstraints={[600, height]}
          resizeHandles={['e']}
          axis="x"
          handle={(h, ref) => (
            <span className={styles.resizeHandle} ref={ref}></span>
          )}
        >
          <div className={styles.questionContainer}>
            <div className={styles.questionContent}>
              <h2 className={styles.questionTitle}>Problem Statement</h2>
              <p className={styles.questionText}>
                Given an array of integers, return indices of the two numbers such
                that they add up to a specific target.
              </p>
            </div>
          </div>
        </ResizableBox>
      </div>

      <div className={styles.editorContainer}>
        <div className={styles.editorHeader}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={styles.languageSelector}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.editorAndOutputContainer}>
          <Editor
            height="calc(100vh - 300px)"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(newValue) => setCode(newValue || "")}
            options={{ fontSize: 16 }}
            className={styles.codeEditor}
          />

          <div className={styles.outputContainer}>
            <div className={styles.outputHeader}>
              <span className={styles.outputTitle}>Output</span>
              <button onClick={clearOutput} className={styles.clearButton}>
                Clear
              </button>
            </div>
            <div className={styles.outputContent}>
              {output.map((item, index) => (
                <div key={index} className={styles[item.type]}>
                  {item.content}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          className={styles.runButton}
          onClick={handleRunCode}
        >
          Run Code
        </button>
      </div>
    </div>
  );
}
