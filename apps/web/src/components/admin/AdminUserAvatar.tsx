import Image from "next/image";
import { User } from "lucide-react";

interface AdminUserAvatarProps {
  src?: string | null;
  name?: string | null;
}

export function AdminUserAvatar({ src, name }: AdminUserAvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name || "User avatar"}
        width={40}
        height={40}
        className="h-10 w-10 rounded-full border border-border object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted">
      <User className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}