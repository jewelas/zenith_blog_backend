export function emailVerificationView(token: string): string{
    const link = `${process.env.FRONTEND_URL}/user/verified/${token}`
    let template = `
     <div style="max-width:700px;
     margin:auto; border:10px solid #ddd; padding:50px 20px; font-size:110%;
     ">
     <h2 style="text-align:center; text-transform:uppercase; color:teal;">Hello Admin welcome to Zenith Blog</h2>
     <p>Hi there, follow the link by clicking on the button to verify your email</p>
     <a href=${link}
     style="background:crimson; text-decoration:none; color:white;
     padding:10px 20px; margin:10px 0;
     display:inline-block;"
     >Click here</a>
     </div>
    `
    return template
}
export default emailVerificationView