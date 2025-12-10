import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className = "" }: CardProps) {
    return (
        <div className={`glass rounded-xl p-6 md:p-8 ${className}`}>
            {children}
        </div>
    );
}
