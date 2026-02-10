import { env } from "@/config";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

export class Encryption {
    // 生成哈希
    public static async hash(text: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(text, saltRounds);
    }

    // 验证哈希
    public static async verifyHash(text: string, hashText: string): Promise<boolean> {
        return bcrypt.compare(text, hashText);
    }

    // 生成签名
    public static generateSignature(data: string): string {
        return crypto.createHmac("sha256", env.APP_SECRET).update(data).digest("hex");
    }

    // 验证签名
    public static verifySignature(data: string, signature: string): boolean {
        try {
            const expectedSignature = this.generateSignature(data);
            if (signature.length != expectedSignature.length) {
                return false;
            }
            // 使用时间安全比较，防止时序攻击
            return crypto.timingSafeEqual(
                Buffer.from(signature, "hex"),
                Buffer.from(expectedSignature, "hex")
            );
        } catch {
            return false;
        }
    }
}
