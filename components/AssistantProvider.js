// // import { createContext, useContext, useState } from 'react';

// // const AssistantContext = createContext(null);

// // export function AssistantProvider({ children }) {
// //   const [isOpen, setIsOpen] = useState(false);

// //   const open = () => setIsOpen(true);
// //   const close = () => setIsOpen(false);
// //   const toggle = () => setIsOpen((prev) => !prev);

// //   return (
// //     <AssistantContext.Provider value={{ isOpen, open, close, toggle }}>
// //       {children}
// //     </AssistantContext.Provider>
// //   );
// // }

// // export function useAssistant() {
// //   const ctx = useContext(AssistantContext);
// //   if (!ctx) {
// //     throw new Error('useAssistant must be used within AssistantProvider');
// //   }
// //   return ctx;
// // }

// import { createContext, useContext, useState } from 'react';

// const AssistantContext = createContext(null);

// export function AssistantProvider({ children }) {
//   const [isOpen, setIsOpen] = useState(false);

//   const open = () => setIsOpen(true);
//   const close = () => setIsOpen(false);
//   const toggle = () => setIsOpen((prev) => !prev);

//   return (
//     <AssistantContext.Provider value={{ isOpen, open, close, toggle }}>
//       {children}
//     </AssistantContext.Provider>
//   );
// }

// export function useAssistant() {
//   const ctx = useContext(AssistantContext);
//   if (!ctx) {
//     throw new Error('useAssistant must be used within AssistantProvider');
//   }
//   return ctx;
// }
import { createContext, useContext, useState } from 'react';

const AssistantContext = createContext(null);

export function AssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);
  return (
    <AssistantContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error('useAssistant must be used within AssistantProvider');
  return ctx;
}