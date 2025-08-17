"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMentorDashboardStats = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors = __importStar(require("cors"));
const corsHandler = cors({ origin: true });
const db = admin.firestore();
exports.getMentorDashboardStats = functions.https.onCall(async (data, context) => {
    return new Promise((resolve, reject) => {
        corsHandler(data, context, async () => {
            try {
                if (!context.auth) {
                    throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
                }
                const mentorId = context.auth.uid;
                const mentorshipsRef = db.collection("mentorships");
                const pendingQuery = mentorshipsRef.where('mentorId', '==', mentorId).where('status', '==', 'pending');
                const acceptedQuery = mentorshipsRef.where('mentorId', '==', mentorId).where('status', '==', 'accepted');
                const [pendingSnapshot, acceptedSnapshot] = await Promise.all([
                    pendingQuery.get(),
                    acceptedQuery.get()
                ]);
                resolve({
                    pendingRequests: pendingSnapshot.size,
                    activeMentees: acceptedSnapshot.size,
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    reject(new functions.https.HttpsError("internal", error.message));
                }
                else {
                    reject(new functions.https.HttpsError("internal", "An unknown error occurred"));
                }
            }
        });
    });
});
//# sourceMappingURL=getMentorDashboardStats.js.map