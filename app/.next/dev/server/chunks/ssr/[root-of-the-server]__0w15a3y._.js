module.exports = [
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[project]/src/app/portfolio/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Portfolio
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$adapter$2d$react$2f$lib$2f$esm$2f$useConnection$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/wallet-adapter-react/lib/esm/useConnection.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$adapter$2d$react$2f$lib$2f$esm$2f$useWallet$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/wallet-adapter-react/lib/esm/useWallet.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useProgram$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useProgram.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/constants.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.mjs [app-ssr] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
function Portfolio() {
    const { program } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useProgram$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProgram"])();
    const { publicKey, sendTransaction } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$adapter$2d$react$2f$lib$2f$esm$2f$useWallet$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useWallet"])();
    const { connection } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$adapter$2d$react$2f$lib$2f$esm$2f$useConnection$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useConnection"])();
    const [positions, setPositions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const fetchPositions = async ()=>{
        if (!program || !publicKey) return;
        try {
            setLoading(true);
            // Fetch all positions for the connected wallet
            // We can use memcmp in production, but for now we filter locally
            const allPositions = await program.account.userPosition.all();
            const myPositions = allPositions.filter((p)=>p.account.user.equals(publicKey));
            // We also need market details to show the name and status
            const markets = await program.account.market.all();
            const enriched = myPositions.map((pos)=>{
                const market = markets.find((m)=>m.publicKey.equals(pos.account.market));
                return {
                    publicKey: pos.publicKey,
                    marketPubKey: pos.account.market,
                    market: market?.account,
                    yesAmount: Number(pos.account.yesAmount),
                    noAmount: Number(pos.account.noAmount),
                    claimed: pos.account.claimed
                };
            });
            setPositions(enriched);
        } catch (e) {
            console.error(e);
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchPositions();
    }, [
        program,
        publicKey
    ]);
    const claimWinnings = async (marketPubKey, positionPubKey)=>{
        if (!program || !publicKey) return;
        try {
            const ix = await program.methods.claimWinnings().accounts({
                user: publicKey,
                market: marketPubKey,
                userPosition: positionPubKey
            }).instruction();
            const tx = new (await __turbopack_context__.A("[project]/node_modules/@solana/web3.js/lib/index.esm.js [app-ssr] (ecmascript, async loader)")).Transaction().add(ix);
            const signature = await sendTransaction(tx, connection);
            await connection.confirmTransaction(signature, 'processed');
            fetchPositions();
        } catch (e) {
            console.error(e);
            alert('Failed to claim winnings.');
        }
    };
    if (!publicKey) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "loading-state",
            children: "Connect your wallet to view your portfolio."
        }, void 0, false, {
            fileName: "[project]/src/app/portfolio/page.tsx",
            lineNumber: 78,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "portfolio-page animate-fade-in",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: "/",
                className: "back-link",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                        size: 16
                    }, void 0, false, {
                        fileName: "[project]/src/app/portfolio/page.tsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, this),
                    " Back to Markets"
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/portfolio/page.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                children: "Your Portfolio"
            }, void 0, false, {
                fileName: "[project]/src/app/portfolio/page.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "loading-state",
                children: "Loading positions..."
            }, void 0, false, {
                fileName: "[project]/src/app/portfolio/page.tsx",
                lineNumber: 90,
                columnNumber: 9
            }, this) : positions.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "empty-state",
                children: "No positions found. Start trading!"
            }, void 0, false, {
                fileName: "[project]/src/app/portfolio/page.tsx",
                lineNumber: 92,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "positions-list",
                children: positions.map((pos)=>{
                    const isWinner = pos.market?.resolved && (pos.market.outcome && pos.yesAmount > 0 || !pos.market.outcome && pos.noAmount > 0);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "position-card glass-panel",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "position-info",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        children: pos.market?.question || 'Unknown Market'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/portfolio/page.tsx",
                                        lineNumber: 102,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "position-amounts",
                                        children: [
                                            pos.yesAmount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "pos-yes",
                                                children: [
                                                    "YES: ",
                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCurrency"])(pos.yesAmount)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/portfolio/page.tsx",
                                                lineNumber: 104,
                                                columnNumber: 43
                                            }, this),
                                            pos.noAmount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "pos-no",
                                                children: [
                                                    "NO: ",
                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatCurrency"])(pos.noAmount)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/portfolio/page.tsx",
                                                lineNumber: 105,
                                                columnNumber: 42
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/portfolio/page.tsx",
                                        lineNumber: 103,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/portfolio/page.tsx",
                                lineNumber: 101,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "position-status",
                                children: !pos.market?.resolved ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "status-badge active",
                                    children: "Active"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/portfolio/page.tsx",
                                    lineNumber: 111,
                                    columnNumber: 21
                                }, this) : pos.claimed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "status-badge claimed",
                                    children: "Claimed"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/portfolio/page.tsx",
                                    lineNumber: 113,
                                    columnNumber: 21
                                }, this) : isWinner ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "claim-btn",
                                    onClick: ()=>claimWinnings(pos.marketPubKey, pos.publicKey),
                                    children: "Claim Winnings"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/portfolio/page.tsx",
                                    lineNumber: 115,
                                    columnNumber: 21
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "status-badge lost",
                                    children: "Loss"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/portfolio/page.tsx",
                                    lineNumber: 122,
                                    columnNumber: 21
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/portfolio/page.tsx",
                                lineNumber: 109,
                                columnNumber: 17
                            }, this)
                        ]
                    }, pos.publicKey.toString(), true, {
                        fileName: "[project]/src/app/portfolio/page.tsx",
                        lineNumber: 100,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/portfolio/page.tsx",
                lineNumber: 94,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/portfolio/page.tsx",
        lineNumber: 82,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/hooks/useProgram.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useProgram",
    ()=>useProgram
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$adapter$2d$react$2f$lib$2f$esm$2f$useAnchorWallet$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/wallet-adapter-react/lib/esm/useAnchorWallet.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$adapter$2d$react$2f$lib$2f$esm$2f$useConnection$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/wallet-adapter-react/lib/esm/useConnection.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$coral$2d$xyz$2f$anchor$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@coral-xyz/anchor/dist/esm/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$coral$2d$xyz$2f$anchor$2f$dist$2f$esm$2f$provider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@coral-xyz/anchor/dist/esm/provider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$coral$2d$xyz$2f$anchor$2f$dist$2f$esm$2f$program$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@coral-xyz/anchor/dist/esm/program/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$idl$2f$prediction_market$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/idl/prediction_market.json.[json].cjs [app-ssr] (ecmascript)");
;
;
;
;
function useProgram() {
    const { connection } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$adapter$2d$react$2f$lib$2f$esm$2f$useConnection$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useConnection"])();
    const wallet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$wallet$2d$adapter$2d$react$2f$lib$2f$esm$2f$useAnchorWallet$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAnchorWallet"])();
    const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!wallet) return null;
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$coral$2d$xyz$2f$anchor$2f$dist$2f$esm$2f$provider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnchorProvider"](connection, wallet, {
            preflightCommitment: 'processed'
        });
    }, [
        connection,
        wallet
    ]);
    const program = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!provider) return null;
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$coral$2d$xyz$2f$anchor$2f$dist$2f$esm$2f$program$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Program"](__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$idl$2f$prediction_market$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], provider);
    }, [
        provider
    ]);
    return {
        program,
        provider,
        connection
    };
}
}),
"[project]/src/idl/prediction_market.json.[json].cjs [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "address": "BvCRDzi8M5f5NREyoKZ62bjxR5kN1yiKu4iHqTmFCzcY",
    "metadata": {
        "name": "prediction_market",
        "version": "0.1.0",
        "spec": "0.1.0",
        "description": "Created with Anchor"
    },
    "instructions": [
        {
            "name": "claim_winnings",
            "discriminator": [
                161,
                215,
                24,
                59,
                14,
                236,
                242,
                221
            ],
            "accounts": [
                {
                    "name": "user",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "market",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    109,
                                    97,
                                    114,
                                    107,
                                    101,
                                    116
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "market.creator",
                                "account": "Market"
                            },
                            {
                                "kind": "account",
                                "path": "market.market_id",
                                "account": "Market"
                            }
                        ]
                    }
                },
                {
                    "name": "user_position",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    112,
                                    111,
                                    115,
                                    105,
                                    116,
                                    105,
                                    111,
                                    110
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "market"
                            },
                            {
                                "kind": "account",
                                "path": "user"
                            }
                        ]
                    }
                }
            ],
            "args": []
        },
        {
            "name": "create_market",
            "discriminator": [
                103,
                226,
                97,
                235,
                200,
                188,
                251,
                254
            ],
            "accounts": [
                {
                    "name": "creator",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "market",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    109,
                                    97,
                                    114,
                                    107,
                                    101,
                                    116
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "creator"
                            },
                            {
                                "kind": "arg",
                                "path": "market_id"
                            }
                        ]
                    }
                },
                {
                    "name": "system_program",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": [
                {
                    "name": "market_id",
                    "type": "u64"
                },
                {
                    "name": "question",
                    "type": "string"
                },
                {
                    "name": "resolution_time",
                    "type": "i64"
                }
            ]
        },
        {
            "name": "place_bet",
            "discriminator": [
                222,
                62,
                67,
                220,
                63,
                166,
                126,
                33
            ],
            "accounts": [
                {
                    "name": "user",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "market",
                    "writable": true
                },
                {
                    "name": "user_position",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    112,
                                    111,
                                    115,
                                    105,
                                    116,
                                    105,
                                    111,
                                    110
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "market"
                            },
                            {
                                "kind": "account",
                                "path": "user"
                            }
                        ]
                    }
                },
                {
                    "name": "system_program",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "bet_yes",
                    "type": "bool"
                }
            ]
        },
        {
            "name": "resolve_market",
            "discriminator": [
                155,
                23,
                80,
                173,
                46,
                74,
                23,
                239
            ],
            "accounts": [
                {
                    "name": "creator",
                    "signer": true
                },
                {
                    "name": "market",
                    "writable": true
                }
            ],
            "args": [
                {
                    "name": "outcome",
                    "type": "bool"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "Market",
            "discriminator": [
                219,
                190,
                213,
                55,
                0,
                227,
                198,
                154
            ]
        },
        {
            "name": "UserPosition",
            "discriminator": [
                251,
                248,
                209,
                245,
                83,
                234,
                17,
                27
            ]
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "OverFlow",
            "msg": "Question is too long"
        },
        {
            "code": 6001,
            "name": "ResolutionTimeInThePast",
            "msg": "Resolution time is in the past"
        },
        {
            "code": 6002,
            "name": "InvalidBetAmount",
            "msg": "Invalid bet amount"
        },
        {
            "code": 6003,
            "name": "MarketResolved",
            "msg": "Market is already resolved"
        },
        {
            "code": 6004,
            "name": "MarketNotResolved",
            "msg": "Market is not resolved yet"
        },
        {
            "code": 6005,
            "name": "AlreadyClaimed",
            "msg": "Winnings already claimed"
        },
        {
            "code": 6006,
            "name": "NoPosition",
            "msg": "No position found"
        }
    ],
    "types": [
        {
            "name": "Market",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "creator",
                        "type": "pubkey"
                    },
                    {
                        "name": "market_id",
                        "type": "u64"
                    },
                    {
                        "name": "question",
                        "type": "string"
                    },
                    {
                        "name": "yes_pool",
                        "type": "u64"
                    },
                    {
                        "name": "no_pool",
                        "type": "u64"
                    },
                    {
                        "name": "resolved",
                        "type": "bool"
                    },
                    {
                        "name": "outcome",
                        "type": {
                            "option": "bool"
                        }
                    },
                    {
                        "name": "resolution_time",
                        "type": "i64"
                    },
                    {
                        "name": "creation_date",
                        "type": "u64"
                    },
                    {
                        "name": "expiry_date",
                        "type": "u64"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    }
                ]
            }
        },
        {
            "name": "UserPosition",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "market",
                        "type": "pubkey"
                    },
                    {
                        "name": "user",
                        "type": "pubkey"
                    },
                    {
                        "name": "yes_amount",
                        "type": "u64"
                    },
                    {
                        "name": "no_amount",
                        "type": "u64"
                    },
                    {
                        "name": "claimed",
                        "type": "bool"
                    },
                    {
                        "name": "bump",
                        "type": "u8"
                    }
                ]
            }
        }
    ],
    "constants": [
        {
            "name": "COUNTER_SEED",
            "type": "bytes",
            "value": "[99, 111, 117, 110, 116, 101, 114]"
        },
        {
            "name": "HELLO_WORLD_LAMPORTS",
            "type": "u64",
            "value": "1"
        },
        {
            "name": "MAX_COUNT",
            "type": "u64",
            "value": "10"
        }
    ]
};
}),
"[project]/src/utils/constants.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LAMPORTS_PER_SOL",
    ()=>LAMPORTS_PER_SOL,
    "PROGRAM_ID",
    ()=>PROGRAM_ID,
    "formatCurrency",
    ()=>formatCurrency,
    "formatDateTime",
    ()=>formatDateTime,
    "formatSol",
    ()=>formatSol,
    "lamportsToSol",
    ()=>lamportsToSol,
    "timeUntil",
    ()=>timeUntil
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/web3.js/lib/index.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$idl$2f$prediction_market$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/idl/prediction_market.json.[json].cjs [app-ssr] (ecmascript)");
;
;
const PROGRAM_ID = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PublicKey"](__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$idl$2f$prediction_market$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].address);
const LAMPORTS_PER_SOL = 1_000_000_000;
const lamportsToSol = (lamports)=>Number(lamports) / LAMPORTS_PER_SOL;
const formatSol = (lamports, decimals = 4)=>`${lamportsToSol(lamports).toFixed(decimals)} SOL`;
const formatDateTime = (unixSeconds)=>{
    const d = new Date(Number(unixSeconds) * 1000);
    return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};
const timeUntil = (unixSeconds)=>{
    const diffMs = Number(unixSeconds) * 1000 - Date.now();
    if (diffMs <= 0) return 'Expired';
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 60) return `in ${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `in ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `in ${diffDays}d`;
};
const formatCurrency = (lamports)=>{
    const sol = lamportsToSol(lamports);
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'narrowSymbol'
    }).format(sol).replace('$', '◎'); // using ◎ for SOL
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0w15a3y._.js.map