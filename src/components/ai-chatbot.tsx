"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Lightbulb,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface QuickAction {
  label: string;
  query: string;
  icon: React.ElementType;
}

const quickActions: QuickAction[] = [
  { label: "Bu ayki giderlerim", query: "Bu ayki toplam giderlerimi göster", icon: TrendingDown },
  { label: "Gelir-gider karşılaştırması", query: "Son 3 ayın gelir-gider karşılaştırmasını yap", icon: TrendingUp },
  { label: "Bakiye durumum", query: "Tüm hesaplarımın bakiye durumunu özetle", icon: Wallet },
  { label: "Son işlemlerim", query: "Son 5 işlemimi listele", icon: Receipt },
  { label: "Tasarruf önerileri", query: "Harcamalarıma göre tasarruf önerileri ver", icon: Lightbulb },
];

// Simple AI response generator (in production, this would call an actual AI API)
function generateResponse(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("gider") && lowerQuery.includes("ay")) {
    return `Bu ayki toplam giderleriniz hesaplanıyor... Şu anda月度 harcamalarınızı analiz ediyorum.\n\n📊 **Bu Ay Özeti:**\n- Toplam Gider: ~2,450,000 IQD\n- En yüksek kategori: Kira (%40)\n- Geçen aya göre: %12 artış\n\n💡 Tasarruf için Market ve Eğlence kalemlerini gözden geçirmenizi öneririm.`;
  }

  if (lowerQuery.includes("gelir") && lowerQuery.includes("gider")) {
    return `Son 3 ayın gelir-gider karşılaştırması:\n\n📈 **Gelir-Gider Analizi:**\n\n| Ay | Gelir | Gider | Net |\n|---|---|---|---|\n| Nisan | 8,500,000 | 6,200,000 | +2,300,000 |\n| Mayıs | 9,100,000 | 7,800,000 | +1,300,000 |\n| Haziran | 8,800,000 | 6,900,000 | +1,900,000 |\n\n✅ Geliriniz istikrarlı. Giderlerdeki artışı kontrol altına almanızı öneririm.`;
  }

  if (lowerQuery.includes("bakiye") || lowerQuery.includes("hesap")) {
    return `Tüm hesaplarınızın bakiye durumu:\n\n💰 **Hesap Özeti:**\n- Vadesiz Hesap: 3,450,000 IQD\n- Birikim Hesabı: 12,800,000 IQD\n- Nakit: 250,000 IQD\n\n📊 **Toplam:** 16,500,000 IQD\n\n✅ Finansal durumunuz sağlıklı görünüyor.`;
  }

  if (lowerQuery.includes("son") && lowerQuery.includes("işlem")) {
    return `Son 5 işleminiz:\n\n1. 🛒 Market Alışverişi - 125,000 IQD (Gider)\n2. 💰 Maaş Ödemesi +8,500,000 IQD (Gelir)\n3. 🏠 Kira Ödemesi -2,500,000 IQD (Gider)\n4. ⚡ Elektrik Faturası -180,000 IQD (Gider)\n5. 🍽️ Restoran -85,000 IQD (Gider)\n\n📝 Detay için İşlemler sayfasına göz atabilirsiniz.`;
  }

  if (lowerQuery.includes("tasarruf") || lowerQuery.includes("öneri")) {
    return `Harcamalarınıza dayalı tasarruf önerileri:\n\n💡 **Öneriler:**\n\n1. **Market Alışverişi (%15 azaltma)**\n   - Haftalık liste yapın\n   - İndirimleri takip edin\n   - Tahmini tasarruf: 150,000 IQD/ay\n\n2. **Restoran/Abur Cubur (%20 azaltma)**\n   - Evde yemek sıklığını artırın\n   - Tahmini tasarruf: 100,000 IQD/ay\n\n3. **Abonelikler**\n   - Kullanılmayan abonelikleri iptal edin\n   - Tahmini tasarruf: 50,000 IQD/ay\n\n💰 **Toplam Potansiyel Tasarruf:** 300,000 IQD/ay`;
  }

  if (lowerQuery.includes("merhaba") || lowerQuery.includes("selam")) {
    return `Merhaba! 👋 Ben MoneyShop AI Asistanınızım.\n\nSize şu konularda yardımcı olabilirim:\n- 📊 Gelir-gider analizi\n- 💰 Bakiye durumu\n- 📈 İşlem geçmişi\n- 💡 Tasarruf önerileri\n- 🎯 Bütçe takibi\n\nNasıl yardımcı olabilirim?`;
  }

  return `Sorunuzu anladım: "${query}"\n\nBu konuda size yardımcı olmaya çalışayım. Daha spesifik sorular sorabilirsiniz:\n\n- "Bu ayki giderlerim ne kadar?"\n- "Gelir-gider karşılaştırması yap"\n- "Tasarruf önerileri ver"\n- "Hesap bakiyelerimi göster"\n\n💡 İpucu: Hızlı seçim butonlarını kullanarak sık sorulan sorulara hızlıca erişebilirsiniz.`;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Merhaba! 👋 Ben MoneyShop AI Asistanınızım. Finansal sorularınızda size yardımcı olabilirim. Nasıl yardımcı olabilirim?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = useCallback(async (text?: string) => {
    const query = text || input.trim();
    if (!query) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const response = generateResponse(query);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 800);
  }, [input]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-red-500 hover:bg-red-600 rotate-0"
            : "bg-secondary hover:bg-secondary-dark hover:scale-110"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] animate-[slide-up_0.3s_ease-out]">
          <Card className="overflow-hidden shadow-2xl border border-border">
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary to-secondary-dark p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">MoneyShop AI</h3>
                  <p className="text-xs text-white/80">Finansal asistanınız</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-surface">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-secondary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      message.role === "user"
                        ? "bg-secondary text-white rounded-br-md"
                        : "bg-surface-tertiary text-text-primary rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.role === "user" ? "text-white/70" : "text-text-muted"}`}>
                      {message.timestamp.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="bg-surface-tertiary rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="w-5 h-5 text-secondary animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-border bg-surface">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleSend(action.query)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-tertiary hover:bg-secondary/10 rounded-full text-xs font-medium text-text-secondary hover:text-secondary transition-colors whitespace-nowrap"
                  >
                    <action.icon className="w-3 h-3" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-surface">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Sorunuzu yazın..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-surface-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isLoading}
                  className="rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
