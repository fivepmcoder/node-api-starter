interface BannerConfig {
    // 应用名称
    name: string;

    // 应用版本
    version: string;

    // 是否启用 ssl
    ssl?: boolean;

    // 服务主机
    host?: string;

    // 服务端口
    port?: number;
}

export const banner = ({
    name,
    version,
    ssl = false,
    host = "localhost",
    port = 3000
}: BannerConfig) => {
    const protocol = ssl ? "https" : "http";
    const url = `${protocol}://${host}:${port}`;

    console.log(`
        \x1b[36m🚀 ${name}\x1b[0m
        \x1b[90m────────────────────────────────────────\x1b[0m

        \x1b[90mVersion\x1b[0m   ${version}
        \x1b[90mStatus\x1b[0m    \x1b[32mRUNNING\x1b[0m

        \x1b[36m➜\x1b[0m  local:   \x1b[36m${url}\x1b[0m
        `);
};
