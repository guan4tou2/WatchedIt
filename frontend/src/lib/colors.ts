export const getStatusColor = (status: string) => {
    switch (status) {
        case "進行中":
            return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200";
        case "已完結":
            return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
        case "暫停":
            return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200";
        case "放棄":
            return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200";
        default:
            return "badge-unselected";
    }
};

export const getTypeColor = (type: string) => {
    switch (type) {
        case "動畫":
            return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200";
        case "電影":
            return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200";
        case "電視劇":
            return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200";
        case "小說":
            return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
        case "漫畫":
            return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200";
        case "遊戲":
            return "bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-200";
        default:
            return "badge-unselected";
    }
};
