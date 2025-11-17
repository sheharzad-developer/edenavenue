import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AuthOptions } from "next-auth";

export const getSession = () => getServerSession(authOptions as AuthOptions);