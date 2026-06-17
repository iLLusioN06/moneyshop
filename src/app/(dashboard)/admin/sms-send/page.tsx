"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Send, Users, Search, CheckCheck } from "lucide-react";

interface UserEntry {
  id: string;
  name: string | null;
  email: string;
  phone: string;
  isActive: boolean;
}

export default function SmsSendPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  function fetchUsers() {
    setLoading(true);
    fetch("/api/admin/users?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.data.filter((u: UserEntry) => u.phone && u.isActive));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setTimeout(() => fetchUsers(), 0);
  }, []);

  function toggleUser(id: string) {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  }

  function selectAll() {
    const filtered = users.filter((u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
    );
    setSelectedUsers(filtered.map((u) => u.id));
  }

  function handleSend() {
    if (!message.trim() || selectedUsers.length === 0) return;
    setSending(true);
    setResult(null);

    fetch("/api/admin/sms-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: selectedUsers, message: message.trim() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setResult(data.result);
          setMessage("");
          setSelectedUsers([]);
        }
      })
      .catch(() => {})
      .finally(() => setSending(false));
  }

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">SMS Gönder</h1>
        <p className="text-text-muted text-sm">Kullanıcılara toplu SMS gönderin</p>
      </div>

      {result && (
        <Card className="border-profit/30 bg-profit/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCheck className="w-5 h-5 text-profit" />
            <span className="text-sm">
              <strong>{result.success}</strong> SMS gönderildi
              {result.failed > 0 && <>, <strong className="text-loss">{result.failed}</strong> başarısız</>}
            </span>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-medium">Alıcılar ({selectedUsers.length} seçili)</span>
                </div>
                <button onClick={selectAll} className="text-xs text-secondary hover:underline">
                  Tümünü Seç
                </button>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Kullanıcı ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface text-sm"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-1">
                {loading ? (
                  <div className="text-center py-4 text-text-muted text-sm">Yükleniyor...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-4 text-text-muted text-sm">Kullanıcı bulunamadı</div>
                ) : (
                  filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.includes(user.id) ? "bg-secondary/10" : "hover:bg-surface-tertiary"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                        className="rounded border-border text-secondary focus:ring-secondary/30"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                        <p className="text-xs text-text-muted">{user.phone}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">SMS Mesajı</label>
                <textarea
                  placeholder="Mesajınızı yazın..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm resize-none"
                />
                <p className="text-xs text-text-muted mt-1">{message.length}/160 karakter</p>
              </div>

              <Button
                onClick={handleSend}
                disabled={!message.trim() || selectedUsers.length === 0 || sending}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? "Gönderiliyor..." : `${selectedUsers.length} Kişiye Gönder`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
