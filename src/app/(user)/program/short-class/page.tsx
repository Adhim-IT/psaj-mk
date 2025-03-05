import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MessageCircle, Calendar, FileText, Award, Play } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/src/components/ui/badge"

export default function ShortClass() {
    return (
        <main className="min-h-screen ">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 md:py-32 ">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:bg-grid-slate-700/25 "></div>
                <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-[#5596DF] to-[#41C5E9] bg-clip-text text-transparent">
                            Online Short Class
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-md">
                            Short Class merupakan program kelas singkat dari Dilesin Academy yang dirancang untuk memberikan pengalaman belajar singkat. Kelas bersifat online sehingga bisa diikuti peserta dari mana saja.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                    href="#"
                                    className="inline-flex items-center px-4 py-2 text-lg font-medium text-white bg-gradient-to-r from-[#5596DF] to-[#41C5E9] rounded-lg hover:from-[#5596DF] hover:to-[#41C5E9] gap-2"
                                >
                                    Lihat Semua Kelas
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>


                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
                                        >
                                            {i}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">500+</span> students enrolled this month
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-80"></div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-100 rounded-full blur-2xl opacity-80"></div>

                            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                                <Image
                                    src="/images/Online-Bootcamp-Intensive.jpg"
                                    width={600}
                                    height={500}
                                    alt="Student learning online"
                                    className="w-full h-auto"
                                    priority
                                />

                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                                    <div className="h-3 w-3 bg-green-500 rounded-full pulse-animation"></div>
                                </div>

                                <div className="absolute -bottom-3 -left-3 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 border border-gray-100">
                                    <MessageCircle className="h-5 w-5 text-blue-500" />
                                    <span className="text-sm font-medium">Live Support</span>
                                </div>

                                <div className="absolute -bottom-3 -right-3 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 border border-gray-100">
                                    <Calendar className="h-5 w-5 text-purple-500" />
                                    <span className="text-sm font-medium">Flexible Schedule</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <Badge className="mb-4">Program Features</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
                        <p className="text-muted-foreground">
                            Our program is designed to provide you with all the tools, resources, and support you need to master new
                            skills and advance your career.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="bg-blue-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Comprehensive Modules</h3>
                                <p className="text-muted-foreground">
                                    Structured learning materials designed by industry experts to ensure you master every concept.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-white hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="bg-purple-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                                    <Play className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Session Recordings</h3>
                                <p className="text-muted-foreground">
                                    Access recordings of all sessions to review concepts and catch up on anything you missed.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="bg-green-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                                    <Calendar className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Flexible Schedule</h3>
                                <p className="text-muted-foreground">
                                    Learn at your own pace with flexible scheduling options that fit your busy lifestyle.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-6">
                                <div className="bg-orange-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                                    <Award className="h-6 w-6 text-orange-600" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Certification</h3>
                                <p className="text-muted-foreground">
                                    Receive an industry-recognized certificate upon successful completion of the program.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="#" className="inline-flex items-center text-blue-600 font-medium hover:underline">
                            Explore All Features
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Learning Methods Section */}
            <section className="py-20 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <Badge className="mb-4">Our Methodology</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Learning Methods in Our Intensive Bootcamp Program</h2>
                        <p className="text-muted-foreground">
                            Our proven learning methodology ensures you gain practical skills through a combination of theory,
                            practice, and real-world projects.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center p-6">
                                <Image
                                    src="/placeholder.svg?height=120&width=120"
                                    width={120}
                                    height={120}
                                    alt="Meetings icon"
                                    className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-xl mb-3">Twice Weekly Sessions</h3>
                                <p className="text-muted-foreground">
                                    Regular twice-weekly sessions ensure consistent learning and progress tracking.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="h-40 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center p-6">
                                <Image
                                    src="/placeholder.svg?height=120&width=120"
                                    width={120}
                                    height={120}
                                    alt="Learning modules icon"
                                    className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-xl mb-3">Sequential Learning with Modules</h3>
                                <p className="text-muted-foreground">
                                    Sequential learning with structured modules for optimal knowledge retention.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="h-40 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center p-6">
                                <Image
                                    src="/placeholder.svg?height=120&width=120"
                                    width={120}
                                    height={120}
                                    alt="Discussion group icon"
                                    className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-xl mb-3">Mentor-led Discussion Groups</h3>
                                <p className="text-muted-foreground">
                                    Interactive discussion groups with mentors to clarify concepts and share ideas.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="h-40 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center p-6">
                                <Image
                                    src="/placeholder.svg?height=120&width=120"
                                    width={120}
                                    height={120}
                                    alt="Final project icon"
                                    className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-xl mb-3">Specialized Final Projects</h3>
                                <p className="text-muted-foreground">
                                    Culminating projects that apply your skills to real-world scenarios relevant to your field.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </main>
    )
}
