const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Article = require('./models/Article');

dotenv.config();

const articles = [
  // TECH (10)
  {
    title: "What is Artificial Intelligence?",
    content: "Artificial Intelligence (AI) refers to the ability of machines to perform tasks that typically require human intelligence, such as learning, reasoning, and decision-making. It uses algorithms and data to simulate human thinking and improve performance over time.\n\nAI is widely used in industries like healthcare, finance, and automation. From chatbots to self-driving cars, AI is transforming how technology interacts with humans and improving efficiency in many fields.",
    category: "Tech"
  },
  {
    title: "Introduction to Web Development",
    content: "Web development is the process of creating websites and web applications that run on the internet. It involves both frontend and backend technologies working together to deliver user experiences.\n\nFrontend focuses on design and interaction, while backend handles server logic and data storage. Together, they make modern web applications dynamic and responsive.",
    category: "Tech"
  },
  {
    title: "What is Cloud Computing?",
    content: "Cloud computing allows users to store and access data over the internet instead of local storage. It provides scalability and flexibility for businesses.\n\nCompanies use cloud platforms like AWS and Google Cloud to manage applications and infrastructure without maintaining physical servers.",
    category: "Tech"
  },
  {
    title: "Basics of Cybersecurity",
    content: "Cybersecurity focuses on protecting systems and data from digital threats. It includes measures like encryption and secure authentication.\n\nWith increasing online activities, cybersecurity plays a vital role in ensuring data privacy and preventing cyber attacks.",
    category: "Tech"
  },
  {
    title: "What is Machine Learning?",
    content: "Machine learning enables systems to learn from data and improve automatically. It is a key part of artificial intelligence.\n\nApplications include recommendation systems, fraud detection, and image recognition, making it a powerful technology in modern computing.",
    category: "Tech"
  },
  {
    title: "Introduction to Databases",
    content: "Databases store and organize data efficiently for applications. They help retrieve and manage information quickly.\n\nPopular databases include SQL-based systems and NoSQL databases like MongoDB, depending on the use case.",
    category: "Tech"
  },
  {
    title: "What is API?",
    content: "An API allows different software systems to communicate with each other. It defines rules for interaction between applications.\n\nAPIs are essential in web development, enabling frontend and backend systems to exchange data seamlessly.",
    category: "Tech"
  },
  {
    title: "Frontend vs Backend Development",
    content: "Frontend development deals with the visual aspects of a website. It ensures users can interact with the application easily.\n\nBackend development handles logic, databases, and server communication. Both are essential for building complete applications.",
    category: "Tech"
  },
  {
    title: "Version Control with Git",
    content: "Git helps developers track changes in their code and collaborate effectively. It maintains a history of modifications.\n\nPlatforms like GitHub allow teams to work together and manage code efficiently using version control systems.",
    category: "Tech"
  },
  {
    title: "What is DevOps?",
    content: "DevOps combines development and operations to improve software delivery. It focuses on automation and collaboration.\n\nThis approach helps teams deploy applications faster while maintaining quality and reliability.",
    category: "Tech"
  },

  // LIFESTYLE (10)
  {
    title: "Importance of Daily Routine",
    content: "A daily routine helps structure your day and improves productivity. It reduces stress by organizing tasks efficiently.\n\nConsistent routines build discipline and contribute to better mental and physical health over time.",
    category: "Lifestyle"
  },
  {
    title: "Healthy Morning Habits",
    content: "Starting your day with healthy habits boosts energy and focus. Activities like exercise and a good breakfast are important.\n\nA strong morning routine sets a positive tone for the rest of the day and improves overall performance.",
    category: "Lifestyle"
  },
  {
    title: "Work-Life Balance",
    content: "Maintaining work-life balance is essential for well-being. It ensures time for both professional and personal activities.\n\nA balanced life reduces stress and increases happiness, leading to better productivity and satisfaction.",
    category: "Lifestyle"
  },
  {
    title: "Benefits of Meditation",
    content: "Meditation helps calm the mind and reduce stress. It improves focus and emotional stability.\n\nRegular practice enhances mental clarity and contributes to overall health and well-being.",
    category: "Lifestyle"
  },
  {
    title: "Minimalist Living",
    content: "Minimalism focuses on living with fewer possessions. It helps reduce stress and improve clarity.\n\nBy simplifying life, individuals can focus more on meaningful experiences and personal growth.",
    category: "Lifestyle"
  },
  {
    title: "Importance of Sleep",
    content: "Sleep is essential for physical and mental health. It helps the body recover and improves brain function.\n\nLack of sleep can lead to health issues, making proper rest important for daily performance.",
    category: "Lifestyle"
  },
  {
    title: "Digital Detox",
    content: "A digital detox involves taking a break from screens. It helps reduce stress and improve focus.\n\nLimiting screen time can improve relationships and mental well-being.",
    category: "Lifestyle"
  },
  {
    title: "Time Management Tips",
    content: "Effective time management helps achieve goals efficiently. It involves prioritizing tasks and avoiding distractions.\n\nProper planning increases productivity and reduces stress.",
    category: "Lifestyle"
  },
  {
    title: "Building Good Habits",
    content: "Good habits are developed through consistency and discipline. Small actions repeated daily lead to big results.\n\nPositive habits improve productivity and overall quality of life.",
    category: "Lifestyle"
  },
  {
    title: "Staying Motivated",
    content: "Motivation helps achieve long-term goals. Setting clear objectives keeps you focused.\n\nTracking progress and celebrating small wins helps maintain motivation.",
    category: "Lifestyle"
  },

  // BUSINESS (10)
  {
    title: "What is Entrepreneurship?",
    content: "Entrepreneurship involves starting and managing a business. It requires innovation and risk-taking.\n\nEntrepreneurs create value and contribute to economic growth.",
    category: "Business"
  },
  {
    title: "Importance of Marketing",
    content: "Marketing helps businesses reach customers. It increases brand awareness and sales.\n\nEffective marketing strategies are essential for business success.",
    category: "Business"
  },
  {
    title: "Basics of Finance",
    content: "Finance involves managing money and investments. It ensures business stability.\n\nProper financial planning helps in long-term growth.",
    category: "Business"
  },
  {
    title: "Customer Satisfaction",
    content: "Customer satisfaction is key to business success. Happy customers return and recommend services.\n\nProviding quality service builds trust and loyalty.",
    category: "Business"
  },
  {
    title: "Digital Marketing",
    content: "Digital marketing uses online platforms to promote products. It includes SEO and social media marketing.\n\nIt is cost-effective and reaches a wide audience.",
    category: "Business"
  },
  {
    title: "Business Strategy",
    content: "A business strategy defines goals and plans. It guides decision-making.\n\nStrong strategies help businesses grow and compete effectively.",
    category: "Business"
  },
  {
    title: "Leadership Skills",
    content: "Leadership involves guiding and motivating teams. Good leaders inspire success.\n\nEffective leadership improves productivity and team performance.",
    category: "Business"
  },
  {
    title: "Startup Challenges",
    content: "Startups face challenges like funding and competition. Managing resources is critical.\n\nOvercoming challenges requires planning and adaptability.",
    category: "Business"
  },
  {
    title: "Branding Basics",
    content: "Branding creates a unique identity. It helps customers recognize products.\n\nStrong branding builds trust and loyalty.",
    category: "Business"
  },
  {
    title: "E-commerce Growth",
    content: "E-commerce has transformed shopping. Online platforms offer convenience.\n\nIt continues to grow rapidly worldwide.",
    category: "Business"
  },

  // HEALTH (10)
  {
    title: "Importance of Exercise",
    content: "Exercise keeps the body fit and healthy. It reduces the risk of diseases.\n\nRegular activity improves physical and mental well-being.",
    category: "Health"
  },
  {
    title: "Balanced Diet",
    content: "A balanced diet provides essential nutrients. It supports overall health.\n\nHealthy eating habits improve energy levels and immunity.",
    category: "Health"
  },
  {
    title: "Mental Health Awareness",
    content: "Mental health is crucial for well-being. Awareness helps reduce stigma.\n\nTaking care of mental health improves quality of life.",
    category: "Health"
  },
  {
    title: "Hydration Benefits",
    content: "Drinking water is essential for body functions. It keeps you hydrated.\n\nProper hydration improves energy and focus.",
    category: "Health"
  },
  {
    title: "Yoga Benefits",
    content: "Yoga improves flexibility and reduces stress. It combines physical and mental exercises.\n\nRegular practice enhances overall health.",
    category: "Health"
  },
  {
    title: "Avoiding Junk Food",
    content: "Limiting junk food prevents health issues. It promotes better nutrition.\n\nHealthy food choices improve long-term health.",
    category: "Health"
  },
  {
    title: "Importance of Vitamins",
    content: "Vitamins support body functions. They boost immunity.\n\nA proper diet ensures adequate vitamin intake.",
    category: "Health"
  },
  {
    title: "Stress Management",
    content: "Managing stress is important for health. Techniques include exercise and relaxation.\n\nReducing stress improves mental clarity.",
    category: "Health"
  },
  {
    title: "Regular Health Checkups",
    content: "Checkups help detect diseases early. Prevention is better than cure.\n\nRegular monitoring ensures better health.",
    category: "Health"
  },
  {
    title: "Healthy Lifestyle Choices",
    content: "Healthy habits improve life quality. Small changes make big differences.\n\nConsistency is key to maintaining good health.",
    category: "Health"
  },

  // EDUCATION (10)
  {
    title: "Importance of Education",
    content: "Education builds knowledge and skills. It helps individuals grow.\n\nIt plays a key role in personal and professional success.",
    category: "Education"
  },
  {
    title: "Online Learning",
    content: "Online learning provides flexibility. It allows access to education anywhere.\n\nDigital platforms have transformed learning methods.",
    category: "Education"
  },
  {
    title: "Study Techniques",
    content: "Effective study methods improve understanding. Active learning is important.\n\nGood techniques help retain information better.",
    category: "Education"
  },
  {
    title: "Time Management for Students",
    content: "Managing time helps students balance tasks. It improves productivity.\n\nPlanning ensures better academic performance.",
    category: "Education"
  },
  {
    title: "Role of Teachers",
    content: "Teachers guide and inspire students. They shape future generations.\n\nGood teaching improves learning outcomes.",
    category: "Education"
  },
  {
    title: "Importance of Reading",
    content: "Reading enhances knowledge and creativity. It improves vocabulary.\n\nRegular reading builds strong thinking skills.",
    category: "Education"
  },
  {
    title: "Learning Skills",
    content: "Learning skills improve problem-solving. They help adapt to challenges.\n\nContinuous learning is essential for growth.",
    category: "Education"
  },
  {
    title: "Exam Preparation",
    content: "Preparation reduces stress and improves results. Consistency is key.\n\nProper planning leads to success in exams.",
    category: "Education"
  },
  {
    title: "Group Study Benefits",
    content: "Group study improves understanding. It encourages discussion.\n\nCollaborative learning enhances knowledge.",
    category: "Education"
  },
  {
    title: "Education Technology",
    content: "Technology enhances learning experiences. It makes education interactive.\n\nModern tools improve accessibility and engagement.",
    category: "Education"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding');

    // Fetch eligible authors (admin or staff)
    const eligibleAuthors = await User.find({ 
      role: { $in: ['admin', 'staff'] } 
    });

    if (eligibleAuthors.length === 0) {
      console.error('ERROR: No admin or staff users found. Please create at least one staff/admin user first.');
      process.exit(1);
    }

    console.log(`Found ${eligibleAuthors.length} eligible authors.`);

    // Clear existing articles
    await Article.deleteMany({});
    console.log('Cleared existing articles.');

    // Prepare articles with random authors
    const preparedArticles = articles.map(article => {
      const randomAuthor = eligibleAuthors[Math.floor(Math.random() * eligibleAuthors.length)];
      return {
        ...article,
        author: randomAuthor._id,
        likes: [] // Start with zero likes
      };
    });

    // Bulk Insert
    await Article.insertMany(preparedArticles);
    console.log(`Successfully seeded ${preparedArticles.length} articles!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
