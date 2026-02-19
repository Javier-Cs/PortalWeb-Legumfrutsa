import { Auth } from "@auth/core";
import Credentials  from "@auth/core/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "../../../lib/prisma";
 

export const { GET, POST } = Auth({
    secret: process.env.AUTH_SECRET,
    
    providers:[
        Credentials({
            /*name: "credentials",

            credentials:{
                email: {label: "Email", type: "email"},
                password:{label: "Password", type: "password"},
            },*/

            async authorize(credentials){
                if(!credentials?.email || !credentials?.password){
                    return null;
                }

                // definir usuario
                const user = await prisma.usuarios.findUnique({
                    where: {email: credentials.email}
                });

                if(!user || user.estado === false) return null;

                // comparar contraseña
                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.pass
                );

                if(!isValid) return null;

                return{
                    id: user.id_user.toString(),
                    email: user.email,
                    name: user.nombre,
                    rol: user.rol,
                    id_empresa: user.id_empresa
                };
            },
        }),
    ],

    session:{
        strategy: "jwt",
    },

    callbacks:{
        async jwt({token, user}){
            if(user){
                token.rol = user.rol;
                token.id_empresa = user.id_empresa;
            }
            return token;
        },
        async session({session, token}){
            session.user.id = token.sub!;
            session.user.rol = token.rol;
            session.user.id_empresa = token.id_empresa;
            return session;
        },
    },


    pages:{
        //signIn: "/login",
        signIn: "/",
    },
    
});