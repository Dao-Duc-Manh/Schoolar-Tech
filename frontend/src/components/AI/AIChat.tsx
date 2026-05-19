import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  icon: string;
  label: string;
}

const quickActions: QuickAction[] = [
  { id: '1', icon: 'auto_awesome', label: 'Tóm tắt nội dung' },
  { id: '2', icon: 'step_forward', label: 'Bước tiếp theo' },
  { id: '3', icon: 'quiz', label: 'Giải thích thêm' },
  { id: '4', icon: 'lightbulb', label: 'Gợi ý học tập' },
];

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Chào bạn! Tôi là AI Cố vấn học tập của Scholar Tech. Tôi đã sẵn sàng đồng hành cùng bạn. Bạn có muốn tôi tóm tắt nội dung bài học hôm nay không?',
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: String(Math.random()).slice(2),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('tóm tắt') || lowerQuestion.includes('summary')) {
      return 'Dưới đây là tóm tắt các điểm chính của bài học hôm nay:\n\n1. **Cấu trúc dữ liệu cây (Tree)** - là một cấu trúc phân cấp với các nút liên kết\n\n2. **Các loại cây**: Cây nhị phân, cây tìm kiếm nhị phân, cây cân bằng\n\n3. **Thao tác cơ bản**: Chèn, xóa, duyệt cây\n\nBạn muốn tôi giải thích chi tiết hơn về phần nào?';
    }
    if (lowerQuestion.includes('giai thich') || lowerQuestion.includes('giải thích')) {
      return 'Cấu trúc dữ liệu cây (Tree) là một cấu trúc dữ liệu phi tuyến tính, trong đó mỗi nút có thể có nhiều nút con. Trong cây nhị phân, mỗi nút có tối đa 2 nút con.\n\n Cây tìm kiếm nhị phân (BST) cho phép tìm kiếm nhanh với độ phức tạp O(log n).';
    }
    return 'Tôi hiểu câu hỏi của bạn. Dựa trên tiến độ học tập của bạn, tôi khuyên bạn nên tập trung vào các bài tập thực hành để nắm vững kiến thức. Bạn cần tôi hỗ trợ gì thêm?';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-8 right-8 z-50">
        <button
          className="group bg-secondary p-5 rounded-2xl shadow-xl shadow-secondary/40 text-white flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
          onClick={() => setIsOpen(true)}
          style={{
            animation: 'pulse 2s infinite',
          }}
        >
          <span
            className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            smart_toy
          </span>
          <span className="font-bold pr-2 tracking-tight">AI Assistant</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-4 bottom-24 w-[calc(100%-2rem)] md:w-[420px] h-[600px] max-h-[80vh] bg-white dark:bg-slate-900 shadow-2xl z-[60] flex flex-col rounded-3xl overflow-hidden border border-outline-variant/10">
      {/* Header */}
      <div className="p-5 flex items-center justify-between bg-gradient-to-r from-primary to-primary-600 text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              smart_toy
            </span>
          </div>
          <div>
            <h4 className="font-headline font-bold text-base leading-tight">AI Study Buddy</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-tertiary-100 rounded-full"></span>
              <span className="text-[11px] font-medium opacity-90 uppercase tracking-wider">Đang trực tuyến</span>
            </div>
          </div>
        </div>
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
          onClick={() => setIsOpen(false)}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-surface-container-low/30">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 max-w-[85%] ${
              message.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-sm">smart_toy</span>
              </div>
            )}
            <div
              className={`p-4 rounded-2xl text-sm ${
                message.role === 'user'
                  ? 'bg-surface-container-highest rounded-tr-none border border-outline-variant/20'
                  : 'bg-primary/5 rounded-tl-none border border-primary/10'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 bg-surface-container-highest rounded-xl flex items-center justify-center text-on-surface-variant shrink-0">
                <span className="material-symbols-outlined text-sm">person</span>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-sm">smart_toy</span>
            </div>
            <div className="bg-primary/5 px-4 py-3 rounded-2xl rounded-tl-none text-primary/60">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Footer */}
      <div className="p-5 bg-white/50 dark:bg-slate-900/50 border-t border-outline-variant/20 backdrop-blur-md">
        {/* Quick Actions */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all flex items-center gap-2 shadow-sm"
              onClick={() => setInputValue(action.label)}
            >
              <span className="material-symbols-outlined text-sm">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="relative">
          <input
            className="w-full bg-surface-container-highest border-none rounded-2xl py-4 pl-5 pr-14 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant"
            placeholder="Hỏi bất cứ điều gì..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}