// 'use client';
// import { useEffect, useRef, useState, useCallback } from 'react';
// import { FaDownload, FaSpinner, FaMicrophone, FaTrash, FaFileWord } from 'react-icons/fa';
// import axios from 'axios';
// import { Document, Packer, Paragraph, TextRun } from 'docx';

// interface TranscriptsProps {
//   stream?: MediaStream | null;
//   autoTranscribe?: boolean;
//   onSummaryUpdate?: (summary: string) => void;
// }

// // interface SpeechRecognition extends EventTarget {
// //   new(): SpeechRecognition;
// //   continuous: boolean;
// //   interimResults: boolean;
// //   lang: string;
// //   start(): void;
// //   stop(): void;
// //   abort(): void;
// //   onresult: (event: SpeechRecognitionEvent) => void;
// //   onerror: (event: SpeechRecognitionErrorEvent) => void;
// //   onend: () => void;
// // }

// interface SpeechRecognition extends EventTarget {
//   continuous: boolean;
//   interimResults: boolean;
//   lang: string;
//   start(): void;
//   stop(): void;
//   abort(): void;
//   onresult: (event: SpeechRecognitionEvent) => void;
//   onerror: (event: SpeechRecognitionErrorEvent) => void;
//   onend: () => void;
// }

// interface SpeechRecognitionEvent extends Event {
//   results: SpeechRecognitionResultList;
//   resultIndex: number;
// }

// interface SpeechRecognitionErrorEvent extends Event {
//   error: string;
//   message: string;
// }

// interface SpeechRecognitionResultList {
//   length: number;
//   [index: number]: SpeechRecognitionResult;
// }

// interface SpeechRecognitionResult {
//   isFinal: boolean;
//   [index: number]: SpeechRecognitionAlternative;
// }

// interface SpeechRecognitionAlternative {
//   transcript: string;
// }
// // interface TranscriptsProps {
// //   stream?: MediaStream | null;
// //   autoTranscribe?: boolean;
// //   onTranscriptionChange?: (text: string) => void;
// // }

// // declare global {
// //   interface Window {
// //     SpeechRecognition: typeof SpeechRecognition;
// //     webkitSpeechRecognition: typeof SpeechRecognition;
// //   }
// // }
// // declare global {
// //   interface Window {
// //     SpeechRecognition: new () => SpeechRecognition;
// //     webkitSpeechRecognition: new () => SpeechRecognition;
// //   } 
// // }
// declare global {
//   interface Window {
//     SpeechRecognition: {
//       new(): SpeechRecognition;
//       prototype: SpeechRecognition;
//     };
//     webkitSpeechRecognition: {
//       new(): SpeechRecognition;
//       prototype: SpeechRecognition;
//     };
//   }
// }

// export default function Transcripts({ stream, autoTranscribe = false, onSummaryUpdate }: TranscriptsProps) {
//   const [transcription, setTranscription] = useState('');
//   const [notes, setNotes] = useState('');
//   const [isListening, setIsListening] = useState(false);
//   const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const transcriptContainerRef = useRef<HTMLDivElement>(null);
//   const isMountedRef = useRef(false);
//   const manuallyStoppedRef = useRef(false)

//   // Auto-scroll to bottom when new transcription comes in
//   useEffect(() => {
//     if (transcriptContainerRef.current) {
//       transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
//     }
//   }, [transcription]);

//   // Initialize speech recognition
//   useEffect(() => {
//     isMountedRef.current = true;
    
//     if (typeof window === 'undefined') return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       setError('Web Speech API not supported in your browser');
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognitionRef.current = recognition;
//     recognition.continuous = true;
//     recognition.interimResults = true;
//     recognition.lang = 'en-US';

//     recognition.onresult = (event: SpeechRecognitionEvent) => {
//       if (!isMountedRef.current) return;
      
//       let finalTranscript = '';
//       for (let i = event.resultIndex; i < event.results.length; i++) {
//         const result = event.results[i];
//         if (result.isFinal) {
//           finalTranscript += result[0].transcript + '\n';
//         }
//       }
//       setTranscription(prev => prev + finalTranscript);
//     };

//     recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//       if (!isMountedRef.current) return;
      
//       console.error('Speech recognition error:', event.error);
      
//       // Don't stop listening for aborted errors (they're usually intentional)
//       if (event.error !== 'aborted') {
//         setIsListening(false);
//         setError(`Speech recognition error: ${event.error}`);
//       }
//     };

//     recognition.onend = () => {
//       if (!isMountedRef.current) return;
      
//     //   if (autoTranscribe && isMountedRef.current) {
//     //     startListening();
//     //   } else {
//     //     setIsListening(false);
//     //   }
//     // };
//     if (autoTranscribe && !manuallyStoppedRef.current) {
//       // Delay slightly to ensure resources are freed if it was an error stop
//       setTimeout(() => {
//           if (isMountedRef.current && recognitionRef.current && !manuallyStoppedRef.current && autoTranscribe) {
//               startListening();
//           }
//       }, 250);
//     } else {
//       setIsListening(false);
//     }};

//     return () => {
//       isMountedRef.current = false;
//       if (recognitionRef.current) { // Check if recognitionRef.current exists
//         recognitionRef.current.abort(); // Use abort for a more immediate stop
//     }
//       recognition.stop();
//     };
    
//   }, [autoTranscribe]);

//   // Handle stream changes
//   // useEffect(() => {
//   //   if (autoTranscribe && stream) {
//   //     manuallyStoppedRef.current = false;
//   //     startListening();
//   //   } else if (!autoTranscribe && isListening) {
//   //     stopListening();
//   //   }
//   // }, [autoTranscribe, stream, isListening, startListening, stopListening]);

//   const startListening = useCallback(() => {
//     if (!recognitionRef.current) return;
//     manuallyStoppedRef.current = false;
//     try {
//       recognitionRef.current.stop(); // Stop any existing session first
//       setTimeout(() => {
//         if (isMountedRef.current && recognitionRef.current && !manuallyStoppedRef.current) {
//           recognitionRef.current.start();
//           setIsListening(true);
//           setError(null);
//         }
//       }, 100);
//     } catch (error) {
//       console.error('Error starting recognition:', error);
//       setIsListening(false);
//       setError('Failed to start microphone');
//     }
    
//   }, []);
//   const stopListening = useCallback(() => {
//     if (recognitionRef.current) {
//       manuallyStoppedRef.current = true;
//       recognitionRef.current.stop();
//       setIsListening(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (autoTranscribe && stream) {
//       manuallyStoppedRef.current = false;
//       startListening();
//     } else if (!autoTranscribe && isListening) {
//       stopListening();
//     }
//   }, [autoTranscribe, stream, isListening, startListening, stopListening]);

//   const generateNotes = useCallback(async (text: string) => {
//     if (!text.trim() || isGeneratingNotes) return;
//     setIsGeneratingNotes(true);
//     setError(null);

//     try {
//       const response = await axios.post(
//         'https://openrouter.ai/api/v1/chat/completions',
//         {
//           model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
//           messages: [{ 
//             role: 'user', 
//             content: `Summarize the following conversation in clear, concise bullet points, do not use any kind of formating styles:\n\n${text}`
//           }],
//           temperature: 0.3,
//           max_tokens: 500,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
//             'Content-Type': 'application/json',
//           },
//           timeout: 30000,
//         }
//       );

//       const summary = response.data?.choices?.[0]?.message?.content;
//       if (summary) {
//         setNotes(summary);
//         onSummaryUpdate?.(summary);
//       }
//     } catch (error) {
//       console.error('Notes generation failed:', error);
//       setError('Failed to generate summary');
//     } finally {
//       setIsGeneratingNotes(false);
//     }
//   }, [isGeneratingNotes, onSummaryUpdate]);

//   const downloadTxt = useCallback(() => {
//     if (!notes) return;
//     setIsDownloading(true);
//     try {
//       const blob = new Blob([notes], { type: 'text/plain' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `conversation-notes-${new Date().toISOString().slice(0, 10)}.txt`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error('Download failed:', error);
//       setError('Failed to download notes');
//     } finally {
//       setIsDownloading(false);
//     }
//   }, [notes]);

//   const downloadDocx = useCallback(async () => {
//     if (!notes) return;
//     setIsDownloading(true);
//     try {
//       const doc = new Document({
//         sections: [{
//           children: [
//             new Paragraph({ children: [new TextRun({ text: 'Conversation Summary', bold: true, size: 28 })] }),
//             new Paragraph({ children: [new TextRun({ text: `Generated: ${new Date().toLocaleString()}`, size: 22, color: '555555' })] }),
//             new Paragraph({ children: [new TextRun("")] }), // Empty line
//             new Paragraph({ children: [new TextRun({ text: notes, size: 24 })] }),
//           ],
//         }],
//       });

//       const blob = await Packer.toBlob(doc);
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `conversation-summary-${new Date().toISOString().slice(0, 10)}.docx`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error('Download failed:', error);
//       setError('Failed to download document');
//     } finally {
//       setIsDownloading(false);
//     }
//   }, [notes]);

//   const clearAll = useCallback(() => {
//     setTranscription('');
//     setNotes('');
//     setError(null);
//     if (isListening) stopListening();
//   }, [isListening, stopListening]);

//   return (
//     <div className="bg-gray-800 p-4 rounded-lg text-white shadow-lg space-y-4">
//       <div className="flex justify-between items-center">
//         <h2 className="text-xl font-semibold flex items-center gap-2">
//           Live Transcription
//           {isListening && (
//             <span className="text-red-500 animate-pulse flex items-center">
//               <FaMicrophone className="inline mr-1" size={14} /> Listening...
//             </span>
//           )}
//         </h2>
//       </div>

//       {error && (
//         <div className="p-2 bg-red-600 text-white rounded-md">
//           {error}
//         </div>
//       )}

//       <div 
//         ref={transcriptContainerRef}
//         className="bg-gray-700 p-4 rounded-md h-64 overflow-y-auto scroll-smooth"
//       >
//         {transcription ? (
//           <div className="space-y-2">
//             {transcription.split('\n').map((paragraph, i) => (
//               <p key={i} className="text-gray-100 whitespace-pre-wrap">
//                 {paragraph}
//               </p>
//             ))}
//           </div>
//         ) : (
//           <p className="text-gray-400 italic">
//             {autoTranscribe ? 'Waiting for audio input...' : 'Click "Start" to begin transcription'}
//           </p>
//         )}
//       </div>

//       <div className="flex flex-wrap gap-3">
//         <button
//           onClick={isListening ? stopListening : startListening}
//           disabled={error?.includes('not supported')}
//           className={`flex-1 min-w-[120px] px-4 py-2 rounded-md flex items-center justify-center gap-2 ${
//             isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
//           } disabled:bg-gray-600 disabled:opacity-50`}
//         >
//           {isListening ? (
//             <>
//               <FaMicrophone /> Stop
//             </>
//           ) : (
//             <>
//               <FaMicrophone /> Start
//             </>
//           )}
//         </button>

//         <button
//           onClick={() => generateNotes(transcription)}
//           disabled={!transcription || isGeneratingNotes}
//           className="flex-1 min-w-[120px] px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 flex items-center justify-center gap-2"
//         >
//           {isGeneratingNotes ? (
//             <>
//               <FaSpinner className="animate-spin" /> Processing...
//             </>
//           ) : (
//             <>
//               <FaFileWord /> Summarize
//             </>
//           )}
//         </button>

//         <button
//           onClick={clearAll}
//           className="flex-1 min-w-[100px] px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 flex items-center justify-center gap-2"
//         >
//           <FaTrash /> Clear
//         </button>
//       </div>

//       {notes && (
//         <div className="space-y-3">
//           <div className="flex justify-between items-center">
//             <h3 className="text-lg font-medium">Summary</h3>
//             <span className="text-sm text-gray-400">{new Date().toLocaleString()}</span>
//           </div>
//           <div className="bg-gray-700 p-4 rounded-md max-h-64 overflow-y-auto">
//             <div className="whitespace-pre-wrap text-gray-100">
//               {notes.split('\n').map((line, i) => (
//                 <p key={i} className="mb-2">{line}</p>
//               ))}
//             </div>
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={downloadTxt}
//               disabled={isDownloading}
//               className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-800 disabled:opacity-50"
//             >
//               {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
//               Download TXT
//             </button>
//             <button
//               onClick={downloadDocx}
//               disabled={isDownloading}
//               className="bg-green-600 px-3 py-2 rounded hover:bg-green-700 flex items-center gap-2 disabled:bg-green-800 disabled:opacity-50"
//             >
//               {isDownloading ? <FaSpinner className="animate-spin" /> : <FaFileWord />}
//               Download DOCX
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { FaDownload, FaSpinner, FaMicrophone, FaTrash, FaFileWord } from 'react-icons/fa';
import axios from 'axios';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface TranscriptsProps {
  stream?: MediaStream | null;
  autoTranscribe?: boolean;
  onTranscriptionUpdate?: (text: string) => void; // New prop for sending updates
  isBroadcaster?: boolean; // New prop to identify if this is the teacher's component
  transcription?: string;
}

export default function Transcripts({ 
  stream, 
  autoTranscribe = false, 
  onTranscriptionUpdate,
  // transcription,
  isBroadcaster = false 
}: TranscriptsProps) {
  const [transcription, setTranscription] = useState('');
  const [notes, setNotes] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);
  const manuallyStoppedRef = useRef(false);

  // Auto-scroll to bottom when new transcription comes in
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcription]);

  // Initialize speech recognition
  useEffect(() => {
    isMountedRef.current = true;
    
    if (!isBroadcaster) return; // Only teachers should transcribe

    const SpeechRecognition = (window as any).SpeechRecognition || 
                            (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Web Speech API not supported in your browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      if (!isMountedRef.current) return;
      
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript + '\n';
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update local state
      setTranscription(prev => prev + finalTranscript);
      
      // Send updates to parent component (broadcast page)
      if (finalTranscript && onTranscriptionUpdate) {
        onTranscriptionUpdate(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      if (!isMountedRef.current) return;
      
      console.error('Speech recognition error:', event.error);
      
      if (event.error !== 'aborted') {
        setIsListening(false);
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (!isMountedRef.current) return;
      
      if (autoTranscribe && !manuallyStoppedRef.current) {
        setTimeout(() => {
          if (isMountedRef.current && recognitionRef.current && !manuallyStoppedRef.current && autoTranscribe) {
            startListening();
          }
        }, 250);
      } else {
        setIsListening(false);
      }
    };

    return () => {
      isMountedRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [autoTranscribe, isBroadcaster, onTranscriptionUpdate]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isBroadcaster) return;
    manuallyStoppedRef.current = false;
    try {
      recognitionRef.current.stop();
      setTimeout(() => {
        if (isMountedRef.current && recognitionRef.current && !manuallyStoppedRef.current) {
          recognitionRef.current.start();
          setIsListening(true);
          setError(null);
        }
      }, 100);
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
      setError('Failed to start microphone');
    }
  }, [isBroadcaster]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      manuallyStoppedRef.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  useEffect(() => {
    if (!isBroadcaster) return; // Only teachers should handle stream transcription
    
    if (autoTranscribe && stream) {
      manuallyStoppedRef.current = false;
      startListening();
    } else if (!autoTranscribe && isListening) {
      stopListening();
    }
  }, [autoTranscribe, stream, isListening, startListening, stopListening, isBroadcaster]);

  const generateNotes = useCallback(async (text: string) => {
    if (!text.trim() || isGeneratingNotes) return;
    setIsGeneratingNotes(true);
    setError(null);

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
          messages: [{ 
            role: 'user', 
            content: `Summarize the following conversation in clear, concise bullet points, do not use any kind of formating styles:\n\n${text}`
          }],
          temperature: 0.3,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const summary = response.data?.choices?.[0]?.message?.content;
      if (summary) {
        setNotes(summary);
      }
    } catch (error) {
      console.error('Notes generation failed:', error);
      setError('Failed to generate summary');
    } finally {
      setIsGeneratingNotes(false);
    }
  }, [isGeneratingNotes]);

  const downloadTxt = useCallback(() => {
    if (!notes) return;
    setIsDownloading(true);
    try {
      const blob = new Blob([notes], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lecture-notes-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download notes');
    } finally {
      setIsDownloading(false);
    }
  }, [notes]);

  const downloadDocx = useCallback(async () => {
    if (!notes) return;
    setIsDownloading(true);
    try {
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ children: [new TextRun({ text: 'Lecture Summary', bold: true, size: 28 })] }),
            new Paragraph({ children: [new TextRun({ text: `Generated: ${new Date().toLocaleString()}`, size: 22, color: '555555' })] }),
            new Paragraph({ children: [new TextRun("")] }),
            new Paragraph({ children: [new TextRun({ text: notes, size: 24 })] }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lecture-summary-${new Date().toISOString().slice(0, 10)}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download document');
    } finally {
      setIsDownloading(false);
    }
  }, [notes]);

  const clearAll = useCallback(() => {
    setTranscription('');
    setNotes('');
    setError(null);
    if (isListening) stopListening();
  }, [isListening, stopListening]);

  if (!isBroadcaster) {
    // For viewers, just show the transcription they receive
    return (
      <div className="bg-gray-800 p-4 rounded-lg text-white shadow-lg">
        <h2 className="text-xl font-semibold mb-2">Lecture Transcription</h2>
        <div 
          ref={transcriptContainerRef}
          className="bg-gray-700 p-4 rounded-md h-64 overflow-y-auto"
        >
          {transcription ? (
            <div className="whitespace-pre-wrap">{transcription}</div>
          ) : (
            <p className="text-gray-400 italic">Waiting for transcription...</p>
          )}
        </div>
      </div>
    );
  }

  // For teachers/broadcasters, show the full component with controls
  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white shadow-lg space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          Live Transcription
          {isListening && (
            <span className="text-red-500 animate-pulse flex items-center">
              <FaMicrophone className="inline mr-1" size={14} /> Listening...
            </span>
          )}
        </h2>
      </div>

      {error && (
        <div className="p-2 bg-red-600 text-white rounded-md">
          {error}
        </div>
      )}

      <div 
        ref={transcriptContainerRef}
        className="bg-gray-700 p-4 rounded-md h-64 overflow-y-auto scroll-smooth"
      >
        {transcription ? (
          <div className="space-y-2">
            {transcription.split('\n').map((paragraph, i) => (
              <p key={i} className="text-gray-100 whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">
            {autoTranscribe ? 'Waiting for audio input...' : 'Click "Start" to begin transcription'}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={error?.includes('not supported')}
          className={`flex-1 min-w-[120px] px-4 py-2 rounded-md ${
            isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          } disabled:bg-gray-600 disabled:opacity-50`}
        >
          {isListening ? (
            <>
              <FaMicrophone /> Stop
            </>
          ) : (
            <>
              <FaMicrophone /> Start
            </>
          )}
        </button>

        <button
          onClick={() => generateNotes(transcription)}
          disabled={!transcription || isGeneratingNotes}
          className="flex-1 min-w-[120px] px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGeneratingNotes ? (
            <>
              <FaSpinner className="animate-spin" /> Processing...
            </>
          ) : (
            <>
              <FaFileWord /> Summarize
            </>
          )}
        </button>

        <button
          onClick={clearAll}
          className="flex-1 min-w-[100px] px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 flex items-center justify-center gap-2"
        >
          <FaTrash /> Clear
        </button>
      </div>

      {notes && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Summary</h3>
            <span className="text-sm text-gray-400">{new Date().toLocaleString()}</span>
          </div>
          <div className="bg-gray-700 p-4 rounded-md max-h-64 overflow-y-auto">
            <div className="whitespace-pre-wrap text-gray-100">
              {notes.split('\n').map((line, i) => (
                <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadTxt}
              disabled={isDownloading}
              className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-800 disabled:opacity-50"
            >
              {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
              Download TXT
            </button>
            <button
              onClick={downloadDocx}
              disabled={isDownloading}
              className="bg-green-600 px-3 py-2 rounded hover:bg-green-700 flex items-center gap-2 disabled:bg-green-800 disabled:opacity-50"
            >
              {isDownloading ? <FaSpinner className="animate-spin" /> : <FaFileWord />}
              Download DOCX
            </button>
          </div>
        </div>
      )}
    </div>
  );
}