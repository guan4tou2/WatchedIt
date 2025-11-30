import { AlertTriangle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface DataReminderProps {
    show: boolean;
    onDismiss: () => void;
}

export default function DataReminder({ show, onDismiss }: DataReminderProps) {
    const reminderT = useTranslations("Home.dataReminder");

    if (!show) return null;

    return (
        <Card className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 animate-fade-in-up">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                                {reminderT("title")}
                            </h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                {reminderT("description")}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onDismiss}
                                    className="text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
                                >
                                    {reminderT("dismiss")}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDismiss}
                        className="text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
