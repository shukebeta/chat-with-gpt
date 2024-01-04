export interface MenuItem {
    label: string;
    link: string;
    icon?: string;
}

export const secondaryMenu: MenuItem[] = [
    {
        label: "GitHub",
        link: "https://github.com/fitchmultz/chat-with-gpt",
        icon: "github fab",
    },
];