import "@auth/core/types";
import "astro"

declare module "@auth/core/types" {
    interface Session{
        user:{
            id: string;
            email: string;
            name: string;
            rol: string;
            id_empresa: number;
        }
    }

    interface User{
        rol: string;
        id_empresa: number;
    }
}


declare module "astro" {
    interface Locals{
        user?:{
            sub: string;
            name: string;
            email: string;
            rol: string;
            id_empresa: number;
        };
    }
}