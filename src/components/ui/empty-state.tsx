import { Button } from "./button";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
  };
  gradient?: string;
}

/**
 * EmptyState
 *
 * Sayfalarda veri olmadığında gösterilen modern boş durum bileşeni.
 * Gradient icon, animasyonlu arka plan, açıklayıcı metin ve opsiyonel CTA butonu içerir.
 *
 * Kullanım:
 * ```tsx
 * <EmptyState
 *   icon={Wallet}
 *   title="Henüz hesap eklenmemiş"
 *   description="Finansal durumunuzu takip etmek için ilk hesabınızı ekleyin."
 *   action={{ label: "Hesap Ekle", onClick: openAddModal, icon: Plus }}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  gradient = "from-secondary to-secondary-dark",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-[fade-in_0.4s_ease-out]">
      {/* Animated Icon Container */}
      <div className="relative mb-6">
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-10 animate-ping" style={{ animationDuration: '2s' }} />
        {/* Icon */}
        <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg animate-[scale-in_0.3s_ease-out]`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-text-primary text-center mb-1.5 animate-[slide-up_0.3s_ease-out]">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-text-muted text-center max-w-sm mb-6 animate-[slide-up_0.3s_ease-out]" style={{ animationDelay: '0.1s' }}>
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <div className="animate-[slide-up_0.3s_ease-out]" style={{ animationDelay: '0.2s' }}>
          <Button onClick={action.onClick} className="group">
            {action.icon && (
              <action.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            )}
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
