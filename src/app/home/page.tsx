
import prisma from "@/lib/db"


export default async function Page() {
    const users = await prisma.user.findMany()

    console.log(users)
    return (
   
           <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
                 <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <h1>Home page</h1>
                {
                    users.map((user,index) => (
                        <div key={index}>
                        {user.email}
                        </div>
                    ))
                }
                 </main>
          
               </div>
    )
}