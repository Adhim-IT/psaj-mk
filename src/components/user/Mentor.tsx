import Image from "next/image";

const mentors = [
  {
    name: "Rizky Maulana",
    expertise: "Full Stack Developer", 
    avatar: "/images/mentor.png",
  },
  {
    name: "Dewi Ananda",
    expertise: "Data Scientist",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Sandi Wijaya", 
    expertise: "Cyber Security Expert",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Laras Setiawan",
    expertise: "UI/UX Designer",
    avatar: "/placeholder.svg?height=100&width=100",
  },
];

export default function MentorSection({ maxMentors }: { maxMentors?: number }) {
  const displayedMentors = maxMentors ? mentors.slice(0, maxMentors) : mentors;
  const columnCount = displayedMentors.length === 1 ? 1 : displayedMentors.length === 3 ? 3 : Math.min(displayedMentors.length, 4);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columnCount} gap-8 justify-center`}>
          {displayedMentors.map((mentor, index) => (
            <div
              key={index}
              className="relative rounded-2xl overflow-hidden shadow-md text-center transition-all duration-500 transform hover:scale-[1.05] hover:shadow-2xl w-[25%] mx-auto h-[100%] group"
            >
              <div className="relative w-full aspect-[9/15] overflow-hidden rounded-lg">
                <Image
                  src={mentor.avatar || "/placeholder.svg"}
                  alt={mentor.name}
                  fill
                  className="rounded-lg object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-500 group-hover:opacity-100"></div>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white transition-opacity duration-500 opacity-100 group-hover:opacity-0">
                <h3 className="text-lg font-semibold">{mentor.name}</h3>
                <p className="text-sm">{mentor.expertise}</p>
              </div>
            </div>
          ))}
        </div>
  );
}
