import { auth } from "@/auth"
import { redirect } from "next/navigation"
import SettingsForm from "@/components/settings/settings-form"
import Navbar from "@/src/components/user/Navbar"
import Footer from "@/src/components/user/Footer"

export default async function SettingsPage() {
    const session = await auth()

    if (!session) {
        return redirect("/login?callbackUrl=/settings")
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white mt-25">
                <div className="max-w-screen-xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row py-8 gap-8">
                        <div className="w-full md:w-1/4">
                            <div className="sticky top-20 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                                    Settings
                                </h1>
                                <p className="text-gray-500 text-sm mt-2">Manage your account preferences</p>
                                <div className="mt-6 space-y-1">
                                    <div className="text-sm font-medium text-gray-900 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg">
                                        User Settings
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-3/4">
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                                {session.user && <SettingsForm user={session.user} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}
