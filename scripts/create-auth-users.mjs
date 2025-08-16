import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import 'dotenv/config';

// Initialize Firebase Admin SDK
initializeApp();
const auth = getAuth();

const users = [
    { email: "Kristi.Waelchi1@hotmail.com", uid: "AHk45V1bWmeRnYwvIv1YxOf7rZX2", role: "mentor" },
    { email: "Paula_Hessel7@yahoo.com", uid: "NjzZxvP77SZTeF7miAQGndCljML2", role: "member" },
    { email: "Leslie.Lowe39@hotmail.com", uid: "flpUnLWO4DU40YN2nAfG2bfzicy2", role: "member" },
    { email: "Kayla.Cremin@gmail.com", uid: "nTUgokVQbCMGSAvSszykvK824GJ2", role: "mentor" },
    { email: "Randall_Fay@gmail.com", uid: "lqXFYZcalcTLazODX3YnvXSzLg02", role: "mentor" },
    { email: "Christina_Harris60@hotmail.com", uid: "gdzW3KSBF9PZ85KwOnVILZBPdLJ3", role: "admin" },
    { email: "Clarence.Ernser93@yahoo.com", uid: "5NVPf7SyavPnaLlGnlVBY2ADfZw1", role: "member" },
    { email: "Felix_Christiansen@hotmail.com", uid: "Ja4CaFg8gxRXqj4Cb3JiEfTFIB12", role: "member" },
    { email: "Ms.Joanne@gmail.com", uid: "AGJdAMOWtcOzGZ3m2jbRFi08zXz1", role: "member" },
    { email: "Courtney.Robel@hotmail.com", uid: "Ky0d7RYaPTdY0ducz6wyrROqTjk2", role: "admin" }
];

const main = async () => {
    try {
        console.log('Creating authentication users...');
        
        for (const user of users) {
            try {
                await auth.createUser({
                    uid: user.uid,
                    email: user.email,
                    password: 'password123',  // Default password from credentials.md
                    emailVerified: true
                });
                console.log(`Created user: ${user.email} with role: ${user.role}`);
            } catch (error) {
                // If the user already exists, that's fine, we'll just skip
                if (error.code === 'auth/uid-already-exists' || error.code === 'auth/email-already-exists') {
                    console.log(`User ${user.email} already exists, skipping...`);
                } else {
                    throw error;
                }
            }
        }

        console.log('All authentication users created successfully!');
    } catch (error) {
        console.error('Error creating authentication users:', error);
        process.exit(1);
    }
};

main();
