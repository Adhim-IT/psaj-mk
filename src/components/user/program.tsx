import { Calendar, FileText, Award, Play } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import Image from 'next/image'
export default function ProgramPage() {
    return (
        <div>
            <section className="py-20">
                <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <Badge className="mb-4">Fitur Program</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Segala yang Anda butuhkan untuk sukses</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Program kami dirancang untuk menyediakan semua alat, sumber daya, dan dukungan yang Anda butuhkan untuk menguasai keterampilan baru dan memajukan karier Anda.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-4">
                                <div className="bg-blue-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Modul Komprehensif</h3>
                                <p className="text-muted-foreground text-sm">
                                    materi pembelajaran terstruktur yang dirancang oleh pakar industri untuk memastikan Anda menguasai setiap konsep.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-white hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-4">
                                <div className="bg-purple-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                                    <Play className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Rekaman Sesi</h3>
                                <p className="text-muted-foreground text-sm">
                                    Akses rekaman semua sesi untuk meninjau konsep dan mengejar apa pun yang Anda lewatkan.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-4">
                                <div className="bg-green-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                                    <Calendar className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Jadwal Fleksibel</h3>
                                <p className="text-muted-foreground text-sm">
                                    Belajar sesuai kecepatan Anda sendiri dengan pilihan penjadwalan fleksibel yang sesuai dengan gaya hidup Anda yang sibuk.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-4">
                                <div className="bg-orange-100 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                                    <Award className="h-6 w-6 text-orange-600" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Sertifikat</h3>
                                <p className="text-muted-foreground text-sm">
                                    Menerima sertifikat yang diakui industri setelah berhasil menyelesaikan program.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Learning Methods Section */}
            <section className="py-20 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <Badge className="mb-4">Metodologi Kami</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Metode Pembelajaran dalam Program Bootcamp Intensif Kami</h2>
                        <p className="text-muted-foreground">
                        Metodologi pembelajaran kami yang telah terbukti memastikan Anda memperoleh keterampilan praktis melalui kombinasi teori, praktik, dan proyek dunia nyata.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center p-6">
                                <Image
                                    src="/images/program/Metodologi-icon1.png"
                                    width={120}
                                    height={120}
                                    alt="Meetings icon"
                                    className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-xl mb-3">Sesi Dua Kali Seminggu</h3>
                                <p className="text-muted-foreground">
                                Sesi rutin dua kali seminggu memastikan pembelajaran dan pelacakan kemajuan yang konsisten.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="h-40 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center p-6">
                                <Image
                                   src="/images/program/Metodologi-icon2.png"
                                    width={120}
                                    height={120}
                                    alt="Learning modules icon"
                                    className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-xl mb-3">Pembelajaran Berurutan dengan Modul</h3>
                                <p className="text-muted-foreground">
                                Pembelajaran berurutan dengan modul terstruktur untuk retensi pengetahuan yang optimal.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="h-40 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center p-6">
                                <Image
                                    src="/images/program/Metodologi-icon3.png"
                                    width={120}
                                    height={120}
                                    alt="Discussion group icon"
                                    className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-xl mb-3">Kelompok Diskusi yang Dipimpin oleh Mentor
                                </h3>
                                <p className="text-muted-foreground">
                                Kelompok diskusi interaktif dengan mentor untuk memperjelas konsep dan berbagi ide.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="h-40 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center p-6">
                                <Image
                                    src="/images/program/Metodologi-icon4.png"
                                    width={120}
                                    height={120}
                                    alt="Final project icon"
                                    className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-xl mb-3">Proyek Akhir Spesialis</h3>
                                <p className="text-muted-foreground">
                                Proyek puncak yang menerapkan keterampilan Anda pada skenario dunia nyata yang relevan dengan bidang Anda.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    )
}