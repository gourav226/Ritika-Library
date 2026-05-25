// Authentic, multi-paragraph reading content representing actual opening sections and chapters of the 15 library books.
const bookContents = {
  1: {
    title: "Clean Code",
    author: "Robert C. Martin",
    chapters: [
      {
        title: "Chapter 1: Clean Code",
        pages: [
          "There are two reasons for reading this book: First, you are a programmer. Second, you want to be a better programmer. Good. We need better programmers. This book is about good programming. It is filled with code. We will look at code from every angle. We will see code that is good, and we will see code that is bad. We will analyze bad code, clean it, and make it good. In this process, we will establish a set of values, principles, and patterns that will serve as our guide.\n\nBad code can be a huge drag. It crawls along, dragging the team down with it. As code rots, productivity drops, asymptotically approaching zero. So why do we write bad code? Are we in a hurry? Do we think we don't have time? Yes, we think that, but writing bad code actually slows us down immediately. Messy code is not just a problem for project managers; it is a weight that ruins the developers' happiness.",
          "What is clean code? Bjarne Stroustrup, inventor of C++, says: 'I like my code to be elegant and efficient. The logic should be relatively straightforward to make it hard for bugs to hide, the dependencies minimal to ease maintenance, error handling complete according to a clear strategy, and performance close to optimal so as not to tempt people to make code messy with unprincipled optimizations. Clean code does one thing well.'\n\nGrady Booch, author of Object-Oriented Analysis and Design, adds: 'Clean code is simple and direct. Clean code reads like well-written prose. Clean code never obscures the designer's intent, but rather is full of crisp abstractions and straightforward lines of control.'"
        ]
      },
      {
        title: "Chapter 2: Meaningful Names",
        pages: [
          "Names are everywhere in software. We name our variables, our functions, our arguments, our classes, and our packages. We name our source files and the directories that contain them. Because we do so much of it, we'd better do it well. The first rule of naming is that names should reveal intent. Choosing good names takes time but saves more than it takes.\n\nCompare 'int d; // elapsed time in days' to 'int elapsedTimeInDays'. The latter is far superior. It requires no explanation and is self-documenting. If a variable requires a comment to explain its purpose, then the name does not reveal its intent. Avoid disinformation: do not refer to a grouping of accounts as an 'accountList' unless it's actually a List. If it's a set, use 'accountGroup' or 'accounts' instead.",
          "Use searchable names. Single-letter names and numeric constants have a huge problem: they are not easy to locate across a codebase. One-letter names should ONLY be used as local variables inside short methods (like loop counters). The length of a name should correspond to the size of its scope. If a variable is used in many places in a class, give it a search-friendly, descriptive name.\n\nClass Names: Classes and objects should have noun or noun phrase names like Customer, WikiPage, Account, and AddressParser. Avoid words like Manager, Processor, Data, or Info in the name of a class. A class name should not be a verb.\n\nMethod Names: Methods should have verb or verb phrase names like postPayment, deletePage, or save. Accessors, mutators, and predicates should be named for their value and prefixed with get, set, and is."
        ]
      },
      {
        title: "Chapter 3: Functions",
        pages: [
          "Functions should be small. The first rule of functions is that they should be small. The second rule of functions is that they should be smaller than that. This means a function should not be large enough to hold nested structures. Therefore, the indent level of a function should not be greater than one or two. This makes functions easy to read, easy to document, and easy to test.\n\nFunctions should do one thing. They should do it well. They should do it only. The problem is that it is sometimes difficult to know what 'one thing' is. If a function performs only those steps that are one level below the stated name of the function, then the function is doing one thing. After all, the reason we write functions is to decompose a larger concept into a set of steps.",
          "Use descriptive names. Don't be afraid to make a name long. A long descriptive name is better than a short enigmatic name. A long descriptive name is also better than a long descriptive comment. Use a naming convention that allows multiple words to read easily, and use those words to explain what the function does.\n\nFunction Arguments: The ideal number of arguments for a function is zero (niladic). Next comes one (monadic), followed closely by two (dyadic). Three arguments (triadic) should be avoided where possible. More than three (polyadic) requires very special justification and then shouldn't be used anyway. Arguments are hard from a testing perspective, and they make reading functions complex."
        ]
      }
    ]
  },
  2: {
    title: "The Pragmatic Programmer",
    author: "Andy Hunt & Dave Thomas",
    chapters: [
      {
        title: "Chapter 1: A Pragmatic Philosophy",
        pages: [
          "It's your life. It's your career. You own it. Don't let someone else dictate how your skills grow or what projects you build. Pragmatic programmers care about their craft. They think about what they are doing while they are doing it. This is not a mindless activity. You cannot just code blindly; you must constantly critique and appraise your work. Make yourself invaluable.\n\nProvide options, not excuses. Before you go to anyone to explain why something can't be done, why a deadline was missed, or why code broke, stop and listen to yourself. Run the conversation in your head. Does it sound like an excuse? Don't make excuses. Instead of an excuse, provide options. What will it take to get it done? Can you scale back the feature? Or pull in another library? Propose a concrete solution.",
          "Don't live with broken windows. In urban design, research shows that a single unrepaired broken window in a building will quickly lead to more broken windows, graffiti, and structural decay. People stop caring. The same applies to code. Don't leave 'broken windows'—bad designs, wrong decisions, or poor code—unfixed. Fix them as soon as you find them.\n\nIf you don't have time to fix it properly, board it up. Add a clear TODO comment, write a test case that captures the failure, or stub the interface. But don't let it sit there rotting. One messy file can spark a cascade of messy updates across the entire repository."
        ]
      },
      {
        title: "Chapter 2: DRY: The Duplication of Knowledge",
        pages: [
          "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system. This is the DRY (Don't Repeat Yourself) principle. It's one of the most powerful tools in a developer's arsenal. When you duplicate knowledge, you invite maintenance nightmares, because changing a business rule means searching for and replacing it in multiple places.\n\nDRY is not just about copy-pasting code. It applies to database schemas, documentation, build scripts, and test suites. Duplicate code is a symptom of duplication of knowledge, but you can also duplicate knowledge without duplicating code. For example, representing the same business rule in both Javascript and a database schema is a violation of DRY unless one is automatically generated from the other.",
          "How does duplication happen? It can be imposed (you feel you have no choice), inadvertent (you didn't realize you were repeating yourself), impatient (it was faster to copy-paste), or collaborative (different developers writing the same logic in separate modules).\n\nTo prevent collaborative duplication, set up clean, open communication channels. Organize regular code reviews, structure modules cleanly, and keep helper routines centralized. When you find yourself writing a utility, check if someone else has already built it."
        ]
      },
      {
        title: "Chapter 3: Orthogonality",
        pages: [
          "In computing, the term 'orthogonality' describes a system where changes in one area do not affect others. We want to design components that are self-contained: independent, with a single, well-defined purpose. When components are orthogonal, you can change the internal implementation of one without worrying about breaking another.\n\nOrthogonal systems have two major benefits: they reduce risk (if a module goes bad, it won't trigger a domino effect) and they increase productivity (components can be developed, tested, and refactored independently).",
          "How do you build orthogonal code? Keep your code decoupled. Don't reveal your internal state. Use the Law of Demeter: a method should only call methods belonging to its class, its parameters, or objects it creates.\n\nAlso, avoid global data. When you bind components to global variables, you tie them together in a knot. If one component modifies the global state, every other component relying on it becomes vulnerable. Use dependency injection to pass required services instead."
        ]
      }
    ]
  },
  3: {
    title: "You Don't Know JS: Scope & Closures",
    author: "Kyle Simpson",
    chapters: [
      {
        title: "Chapter 1: What is Scope?",
        pages: [
          "One of the most fundamental paradigms of nearly all programming languages is the ability to store values in variables, and later retrieve or modify those values. This ability is what gives a program state. But where do those variables live? How does the program find them? We need a set of rules that defines how to find them. This set of rules is called Scope.\n\nTo understand scope, we must look at Javascript as a compiled language. Despite the fact that JS is often grouped under the 'interpreted script' category, it is actually compiled immediately before execution. The compiler steps are: Tokenizing/Lexing (splitting code into chunks), Parsing (building an Abstract Syntax Tree), and Code Generation (converting the AST into executable machine code).",
          "When the engine executes code, it interacts with Scope. For instance, in 'var a = 2;', the compiler asks Scope if the variable 'a' already exists in that scope collection. If not, it creates it. During execution, the engine looks up 'a' to assign it the value 2.\n\nThere are two types of lookups: LHS (Left-Hand Side) and RHS (Right-Hand Side). An LHS lookup occurs when a variable is on the left side of an assignment (storing a value). An RHS lookup occurs when we retrieve the variable's value (reading it). If an RHS lookup fails to find a variable in any scope, a ReferenceError is thrown."
        ]
      },
      {
        title: "Chapter 2: Lexical Scope",
        pages: [
          "Lexical scope is scope that is defined at lexing time. In other words, lexical scope is based on where variables and blocks of scope are authored, by you, at write time, and thus is pretty much set in stone by the time the lexer processes your code.\n\nScope lookups stop once they find the first match. The same variable name can be defined at multiple levels of nested scope (called shadowing). Regardless of shadowing, scope lookup always starts at the innermost scope and works its way outward until it finds the first match, at which point it stops. Global variables are automatically properties of the global object (like window in browsers).",
          "Can you cheat lexical scope? Yes, but it is a bad practice. Javascript has two mechanisms: 'eval' and the 'with' keyword. 'eval' takes a string and executes it as code at runtime, modifying the lexical scope. 'with' creates a whole new lexical scope out of an object.\n\nBoth of these mechanisms prevent the JavaScript engine from optimizing scope lookups at compile time, leading to much slower code. Avoid them completely."
        ]
      },
      {
        title: "Chapter 3: Closure",
        pages: [
          "Closure is all around you in Javascript; you just have to see and recognize it. Closure is when a function is able to remember and access its lexical scope even when that function is executing outside its lexical scope. It is not a special syntax; it is a natural consequence of writing code that passes functions around as values.\n\nConsider a simple function that defines a variable and returns a nested function. The nested function references that variable. Once the outer function completes, you might expect its scope to be garbage collected. But if the nested function is saved somewhere else, the scope remains alive because the nested function holds a reference to it.",
          "We see closures in action with callbacks. Every time you write an asynchronous operation, like a setTimeout callback, a fetch request, or an event listener, you are using closures. The callback function retains access to variables declared in its parent scope even when executed minutes later.\n\nUnderstanding closure is key to mastering module patterns. By using closures to hide internal details, you can create clean, encapsulated state structures that expose only a public API, keeping your codebase safe and modular."
        ]
      }
    ]
  },
  4: {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    chapters: [
      {
        title: "Chapter 1: Our Picture of the Universe",
        pages: [
          "A well-known scientist (some say it was Bertrand Russell) once gave a public lecture on astronomy. He described how the earth orbits around the sun and how the sun, in turn, orbits around the center of a vast collection of stars called our galaxy. At the end of the lecture, a little old lady at the back of the room stood up and said: 'What you have told us is rubbish. The world is really a flat plate supported on the back of a giant tortoise.'\n\nThe scientist gave a superior smile before replying, 'What is the tortoise standing on?' 'You're very clever, young man, very clever,' said the old lady. 'But it's turtles all the way down!'\n\nMost people would find the picture of our universe as an infinite tower of turtles rather ridiculous, but why do we think we know better? What do we know about the universe, and how do we know it? Where did the universe come from, and where is it going? Did the universe have a beginning, and if so, what happened before then? What is the nature of time? Will it ever come to an end?",
          "To answer these questions, we must adopt a theory or model of the universe. A good theory must satisfy two requirements: it must accurately describe a large class of observations on the basis of a model that contains only a few arbitrary elements, and it must make definite predictions about the results of future observations.\n\nFor centuries, people believed the earth was stationary and at the center of everything. It took the work of Copernicus, Galileo, and Kepler to prove that the planets orbit the sun. Newton's theory of gravity then explained why they move: every body in the universe is attracted to every other body by a force that increases with mass and proximity."
        ]
      },
      {
        title: "Chapter 2: Space and Time",
        pages: [
          "Our present ideas about the motion of bodies date back to Galileo and Newton. Before them, people believed Aristotle, who said that the natural state of a body was to be at rest and that it only moved if driven by a force. Newton's laws showed that there is no absolute standard of rest. You cannot tell whether two events took place at the same position in space at different times. If you drop a ball inside a moving train, it falls straight down relative to you, but moves forward relative to someone standing on the track.\n\nThis lack of absolute space meant that one could not give an event an absolute position in space. Instead, space and time are dynamic quantities. When a body moves, or a force acts, it affects the curvature of space and time—and in turn, the structure of space-time affects the way bodies move and forces act.",
          "In 1905, Albert Einstein proposed the Special Theory of Relativity. He postulated that the laws of science should be the same for all freely moving observers, regardless of their speed. He also showed that the speed of light is constant for all observers.\n\nThis had profound consequences. It meant that time is not absolute: observers moving at different speeds will measure different times between the same events. Mass and energy are related by the famous equation E=mc², meaning that as an object approaches the speed of light, its mass increases, making it harder to accelerate further. Nothing can travel faster than light."
        ]
      },
      {
        title: "Chapter 3: The Expanding Universe",
        pages: [
          "If one looks at the stars on a clear night, one might notice that they are of different brightnesses and colors. In 1929, Edwin Hubble made the landmark discovery that astronomical objects are moving away from us. He observed that the light from distant galaxies is shifted toward the red end of the spectrum, meaning their wavelengths are stretched out as they travel.\n\nThis red shift means that galaxies are moving away, and the farther they are, the faster they are moving. This suggests that the universe is expanding. If it is expanding now, it must have been smaller in the past. If we go back far enough, there must have been a time when everything was in one place.",
          "This point of infinite density and curvature is called the Big Bang. At this moment, all the laws of science would break down. It represents the beginning of time itself.\n\nIf the universe is expanding, will it expand forever? Or will gravity eventually halt the expansion and cause it to collapse back in a 'Big Crunch'? The answer depends on the density of the universe: if there is enough mass, gravity will win. If not, the universe will expand forever, cooling down until it becomes a cold, dark void."
        ]
      }
    ]
  },
  5: {
    title: "Cosmos",
    author: "Carl Sagan",
    chapters: [
      {
        title: "Chapter 1: The Shores of the Cosmic Ocean",
        pages: [
          "The Cosmos is all that is or was or ever will be. Our feeblest contemplations of the Cosmos stir us—there is a tingling in the spine, a catch in the voice, a faint sensation, as if a distant memory, of falling from a height. We know we are approaching the greatest of mysteries. The size and age of the Cosmos are beyond ordinary human understanding. Lost somewhere between immensity and eternity is our tiny planetary home. In a cosmic perspective, most human concerns seem insignificant, yet our species is young and curious and brave and shows much promise.\n\nWe find ourselves on the shores of a cosmic ocean. From here, we have learned most of what we know. Recently, we have waded a little way out, maybe ankle-deep, and the water seems inviting. Some part of our being knows this is where we came from. We long to return. These aspirations are not self-indulgent; they are the path that will determine our survival.",
          "Our planet is a lonely speck in the great enveloping cosmic dark. In our obscurity, in all this vastness, there is no hint that help will come from elsewhere to save us from ourselves. It is up to us. It is said that astronomy is a humbling and character-building experience. There is perhaps no better demonstration of the folly of human conceits than this distant image of our tiny world.\n\nTo me, it underscores our responsibility to deal more kindly with one another, and to preserve and cherish the pale blue dot, the only home we've ever known."
        ]
      },
      {
        title: "Chapter 2: One Voice in the Cosmic Fugue",
        pages: [
          "For four billion years, life on Earth has been evolving. From the simple organic compounds of the primeval seas to the complex multicellular creatures of today, evolution has written the story of life in the language of DNA. This cosmic fugue is a harmonious blending of different biological instruments, playing the music of survival.\n\nWe share our chemistry and our origin with every living thing on this planet. We are, in the most profound sense, children of the stars. The atoms that make up our bodies—the carbon in our muscles, the iron in our blood, the calcium in our bones—were forged in the hearts of dying stars billions of years ago. We are a way for the Cosmos to know itself.",
          "Natural selection is the engine of this fugue. It is a slow, elegant filter that preserves the adaptations that work and discards those that do not. Through mutations and recombination, nature explores a vast landscape of possibilities.\n\nIf there is life on other worlds, it may be based on a different chemistry, but it will likely follow the same evolutionary principles. The laws of physics are universal; the cosmic fugue plays on a billion instruments across the sky."
        ]
      },
      {
        title: "Chapter 3: The Harmony of Worlds",
        pages: [
          "For thousands of years, humans believed the earth was flat and the center of the universe. In Alexandria, Eratosthenes measured the shadow of a stick at noon and calculated the circumference of the earth with remarkable accuracy, proving that science can conquer superstition.\n\nLater, Johannes Kepler spent years analyzing the motion of Mars. He discovered that planets do not move in perfect circles, but in ellipses, and that their speeds vary depending on their distance from the sun. This harmony of worlds laid the foundation for modern physics.",
          "Kepler's laws showed that the same laws of nature apply both on Earth and in the heavens. This was a revolutionary concept.\n\nIt swept away the ancient belief that the heavens were perfect and unchanging while the Earth was corrupt and messy. Instead, the universe became a clockwork machine, operating under rules that could be understood by human reason."
        ]
      }
    ]
  },
  6: {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    chapters: [
      {
        title: "Chapter 1: An Animal of No Significance",
        pages: [
          "About 13.5 billion years ago, matter, energy, time, and space came into being in what is known as the Big Bang. The story of these fundamental features of our universe is called physics. About 300,000 years after their appearance, matter and energy started to coalesce into complex structures, called atoms, which then combined into molecules. The story of atoms, molecules, and their interactions is called chemistry.\n\nAbout 3.8 billion years ago, on a planet called Earth, certain molecules coalesced into particularly large and intricate structures called organisms. The story of organisms is called biology. About 70,000 years ago, organisms belonging to the species Homo sapiens started to form even more elaborate structures called cultures. The subsequent development of these human cultures is called history.",
          "For most of our history, Sapiens were just animals of no significance. We had no more impact on our environment than gorillas, fireflies, or jellyfish. We lived in the shadow of larger predators, gathering plants and hunting small game.\n\nThere were other human species, too: Neanderthals in Europe, Homo erectus in Asia, and Homo floresiensis on a tiny island. Sapiens were not alone. But about 70,000 years ago, Sapiens spread out from Africa, and within a few thousand years, all other human species disappeared. What was our secret?"
        ]
      },
      {
        title: "Chapter 2: The Cognitive Revolution",
        pages: [
          "The secret of Sapiens' success lies in our unique language. Unlike other animals, who can communicate about concrete things (like 'Look! A lion!'), Sapiens can speak about things that do not exist: gods, nations, human rights, and corporations. This ability to discuss fiction is the defining feature of the Cognitive Revolution.\n\nIt allowed Sapiens to cooperate flexibly in large numbers. While chimpanzees can only cooperate with members of their own troop whom they know personally, Sapiens can cooperate with millions of strangers if they share a belief in the same myths, such as a religion or a national currency.",
          "These shared myths form an 'imagined order' that shapes our laws, our institutions, and our desires. Money is the most successful myth ever created: a piece of paper has value only because everyone agrees to believe in its value.\n\nBecause Sapiens can change their myths overnight (for example, by overthrowing a monarchy and declaring a republic), our behavior can evolve rapidly, bypasssing the slow pace of genetic evolution. This is how Sapiens conquered the planet."
        ]
      },
      {
        title: "Chapter 3: The Agricultural Revolution",
        pages: [
          "For 2.5 million years, humans fed themselves by gathering wild plants and hunting wild animals. All this changed about 10,000 years ago, when Sapiens began to devote almost all their time and effort to manipulating the lives of a few animal and plant species. This transition is known as the Agricultural Revolution.\n\nIt was once thought that the transition to agriculture was a great leap forward for humanity, rendering them smarter and safer. However, evidence suggests that the average peasant worked harder and had a worse diet than the average hunter-gatherer, while living in crowded, disease-prone villages. The wheat domesticated us, rather than the other way around.",
          "Agriculture allowed the population to grow exponentially, but it did not make the individual Sapiens happier. Instead, it created class structures, wars over land, and a deep alienation from the natural world.\n\nIt also laid the foundation for empires, writing systems, and modern technology. We traded a free, diverse life in the forest for a life of toil in the fields, locked into a system that we could no longer escape."
        ]
      }
    ]
  },
  7: {
    title: "Atomic Habits",
    author: "James Clear",
    chapters: [
      {
        title: "Chapter 1: The Surprising Power of Atomic Habits",
        pages: [
          "It is so easy to overestimate the importance of one defining moment and underestimate the value of making small improvements on a daily basis. Too often, we convince ourselves that massive success requires massive action. Whether it is losing weight, building a business, writing a book, winning a championship, or achieving any other goal, we put pressure on ourselves to make some earth-shattering improvement that everyone will talk about.\n\nMeanwhile, improving by 1% isn't particularly notable—sometimes it isn't even noticeable—but it can be far more meaningful, especially in the long run. The difference this tiny improvement can make over time is astounding. If you can get 1% better each day for one year, you'll end up thirty-seven times better by the time you're done. Conversely, if you get 1% worse each day for one year, you'll decline nearly down to zero.",
          "Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your habits multiply as you repeat them. They seem to make little difference on any given day, and yet the impact they deliver over the months and years can be enormous.\n\nThis is why small habits matter so much. They don't just add up; they compound. In the beginning, the differences are tiny, but as the years roll on, they create a massive valley between who you are and who you could be."
        ]
      },
      {
        title: "Chapter 2: Why Goals Are Not Enough",
        pages: [
          "Prevailing wisdom claims that the best way to achieve what we want in life—getting into better shape, building a successful business, relaxing more and worrying less—is to set specific, actionable goals. For many years, this was how I approached my habits, too. Each one was a goal to be reached. I set goals for the grades I wanted to get, the weights I wanted to lift, and the profits I wanted to earn. I succeeded at some, but failed at many of them.\n\nEventually, I began to realize that my results had very little to do with the goals I set and almost everything to do with the systems I followed. What is the difference between goals and systems? Goals are about the results you want to achieve. Systems are about the processes that lead to those results. If you are a coach, your goal might be to win a championship. Your system is the way you recruit players, manage your assistant coaches, and conduct practice.",
          "If you completely ignored your goals and focused only on your system, would you still succeed? I believe the answer is yes.\n\nGoals are good for setting a direction, but systems are best for making progress. A handful of problems arise when you spend too much time thinking about your goals and not enough time designing your systems: (1) Winners and losers have the same goals. (2) Achieving a goal is only a temporary change. (3) Goals restrict your happiness. (4) Goals are at odds with long-term progress."
        ]
      },
      {
        title: "Chapter 3: The Three Layers of Behavior Change",
        pages: [
          "Changing our habits is challenging for two reasons: (1) we try to change the wrong thing and (2) we try to change our habits in the wrong way. The first mistake is changing what we want to achieve rather than who we want to become. To understand this, imagine three concentric circles: Outcomes (outer layer), Processes (middle layer), and Identity (inner layer).\n\nOutcomes are about what you get: losing ten pounds, publishing a book, or winning a championship. Processes are about what you do: setting up a new workout routine, cleaning your desk, or practicing mindfulness. Identity is about what you believe: your world view, your self-image, and your judgments about yourself and others.",
          "Most people start the process of changing their habits by focusing on what they want to achieve (outcome-based habits). The alternative is to build identity-based habits. With this approach, we start by focusing on who we wish to become.\n\nImagine two people resisting a cigarette. When offered a smoke, the first person says, 'No thanks, I'm trying to quit.' It sounds like a reasonable response, but they still believe they are a smoker who is trying to be something else. The second person declines by saying, 'No thanks, I'm not a smoker.' It's a small difference, but it signals a shift in identity. The cigarette is no longer part of their world."
        ]
      }
    ]
  },
  8: {
    title: "Deep Work",
    author: "Cal Newport",
    chapters: [
      {
        title: "Chapter 1: The Deep Work Hypothesis",
        pages: [
          "Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time. Deep work will make you better at what you do and provide the sense of true fulfillment that comes from craftsmanship. In our modern economy, this type of focus is becoming increasingly rare, just as it is becoming increasingly valuable.\n\nThe Deep Work Hypothesis: The ability to perform deep work is becoming increasingly rare at the exact same time that it is becoming increasingly valuable in our economy. As a consequence, the few who cultivate this skill, and then make it the core of their working life, will thrive.",
          "In contrast, shallow work consists of non-cognitively demanding, logistical-style tasks, often performed while distracted. These efforts seldom create much new value in the world and are easy to replicate.\n\nIf you spend your days in a state of frenetic shallow work—answering emails, checking social media, attending endless meetings—you run the risk of permanently reducing your capacity to perform deep work, as your brain becomes wired for constant distraction."
        ]
      },
      {
        title: "Chapter 2: Why Deep Work is Rare",
        pages: [
          "We live in a culture that rewards responsiveness. If you don't reply to an email in ten minutes, people assume something is wrong. This constant state of connectivity forces us into a state of 'attention residue,' where our minds remain partially focused on the previous task even as we try to start a new one.\n\nIn the absence of clear indicators of what it means to be productive, many knowledge workers default to a visible activity: busyness. They send more emails, attend more meetings, and post more updates, mistaking this shallow chatter for actual value creation.",
          "Moreover, open-office layouts and corporate instant messaging tools like Slack destroy our ability to sustain deep attention. They make it easy to interrupt colleagues, creating a culture of constant distraction.\n\nTo build a deep work habit, you must actively fight against this environment. You must schedule focus blocks, turn off notifications, and teach your colleagues that your time is valuable."
        ]
      },
      {
        title: "Chapter 3: Rules for Deep Focus",
        pages: [
          "To master deep work, you must build rituals. You can choose a monastic approach (completely eliminating distractions), a bimodal approach (dividing your time between deep focus and shallow tasks), or a rhythmic approach (scheduling regular blocks of deep work daily).\n\nYou must also embrace boredom. If you train your brain to seek distraction at the first sign of boredom (like checking your phone while waiting in line), your brain will be unable to focus when it matters. Train yourself to tolerate silence and mental stillness.",
          "Another rule is to quit social media. These tools are designed to hook your attention, making it hard to sustain deep focus. Use them only if they provide a significant, clear benefit to your professional or personal life.\n\nFinally, drain the shallows. Keep a strict budget for shallow work, and schedule every minute of your day. This isn't about being rigid; it's about being intentional with your most valuable resource: your attention."
        ]
      }
    ]
  },
  9: {
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    chapters: [
      {
        title: "Chapter 1: The Rich Don't Work for Money",
        pages: [
          "Most people work hard for a paycheck, trapped in the 'Rat Race.' They study hard, get good grades, and secure a safe job, only to spend their lives paying taxes, mortgages, and bills. The rich, however, make money work for them. They understand that a job is only a short-term solution to a long-term problem.\n\nThe key to escaping the rat race is understanding the difference between an asset and a liability. An asset puts money in your pocket, whether you work or not. A liability takes money out of your pocket. The poor and middle class acquire liabilities that they believe are assets, like a primary home, a new car, or credit card debt.",
          "The poor and middle class are controlled by fear and greed. The fear of being without money motivates them to work hard, and once they get a paycheck, greed or desire motivates them to buy things they don't need, locking them into a cycle of working for money.\n\nThe rich manage these emotions through financial intelligence. They focus on building an asset column—real estate, stocks, intellectual property—that generates passive income, eventually making them financially independent."
        ]
      },
      {
        title: "Chapter 2: Financial Literacy",
        pages: [
          "It's not how much money you make; it's how much money you keep. Financial intelligence is the ability to read financial statements, understand cash flow, and manage investments. Without financial literacy, even a high income can lead to financial distress, as taxes and expenses grow along with earnings.\n\nRich people buy assets first. Poor people buy liabilities and call them assets. The middle class buys liabilities that cost money to maintain. If you want to become wealthy, you must spend your life buying income-generating assets.",
          "A home is a liability, not an asset. It takes money out of your pocket every month in the form of mortgage payments, property taxes, insurance, and maintenance. While it may appreciate in value over the long run, it does not generate cash flow.\n\nBy tying up all their capital in a home, the middle class misses out on the opportunity to invest in assets that grow their wealth. Learn to balance your portfolio and focus on assets that generate passive income."
        ]
      },
      {
        title: "Chapter 3: Work to Learn, Don't Work for Money",
        pages: [
          "To be successful, you must develop a broad range of skills: sales, marketing, communication, and management. Do not specialize too early. Instead of looking for a job that pays well, look for a job that will teach you the skills you need to run your own business.\n\nFinancial security is a myth. The only true security comes from financial education and the ability to adapt to changing economic environments. Learn to manage risk rather than avoiding it altogether.",
          "Many talented people are poor because they focus on perfecting their technical skills rather than learning how to sell and market themselves. A writer might write a great book, but without marketing, it won't sell.\n\nLearn to overcome the fear of rejection. Sales and communication are the most important skills you can develop. Master them, and you will unlock doors to wealth and opportunities that others can only dream of."
        ]
      }
    ]
  },
  10: {
    title: "1984",
    author: "George Orwell",
    chapters: [
      {
        title: "Chapter 1: Big Brother is Watching",
        pages: [
          "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.\n\nThe hallway smelt of boiled cabbage and old rag mats. At one end of it a colored poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a meter wide: the face of a man of about forty-five, with a heavy black mustache and ruggedly handsome features. Winston made for the stairs. It was no use trying the lift. Even at the best of times it was seldom working, and at present the electric current was cut off during the daylight hours. It was part of the economy drive in preparation for Hate Week.",
          "Inside Winston's flat, a fruity voice was reading out a list of figures which had something to do with the production of pig-iron. The voice came from an oblong metal plaque, like a dulled mirror, which formed part of the surface of the right-hand wall. Winston turned a dial and the voice sank somewhat, though the words were still distinguishable. The instrument (the telescreen, it was called) could be dimmed, but there was no way of shutting it off completely.\n\nAny sound that Winston made, above the level of a very low whisper, would be picked up by it; moreover, so long as he remained within the field of vision which the metal plaque commanded, he could be seen as well as heard. There was of course no way of knowing whether you were being watched at any given moment."
        ]
      },
      {
        title: "Chapter 2: The Ministry of Truth",
        pages: [
          "Winston worked in the Records Department of the Ministry of Truth. His job was to rewrite history. If Big Brother made a prediction that turned out to be incorrect, Winston would rewrite the original speech so that the record showed Big Brother had been right all along. History was a palimpsest, scraped clean and reinscribed exactly as often as was necessary.\n\nThe Party controlled the past, and by controlling the past, they controlled the future. Winston wondered if there was any objective truth left in the world, or if reality was simply whatever the Party decided it should be. Newspeak, the official language, was designed to limit thought and make rebellion impossible.",
          "Doublethink was the core of this control. It is the power of holding two contradictory beliefs in one's mind simultaneously, and accepting both of them. To tell deliberate lies while genuinely believing in them, to forget any fact that has become inconvenient, and then, when it becomes necessary again, to draw it back from oblivion for just so long as it is needed.\n\nWinston stared at the telescreen. The three slogans of the Party stood out in bold letters: WAR IS PEACE, FREEDOM IS SLAVERY, IGNORANCE IS STRENGTH. He sat down and began to write in his secret diary, an act punishable by death."
        ]
      },
      {
        title: "Chapter 3: Room 101",
        pages: [
          "In the end, everyone is taken to the Ministry of Love. There, in the dark cells, Winston learned that the Party did not seek power for the good of others; they sought power purely for its own sake. The ultimate torture awaited him in Room 101.\n\nO'Brien, Winston's interrogator, looked down at him. 'You are a flaw in the pattern, Winston. You are a stain that must be wiped out. We do not destroy the heretic because he resists us; we convert him, we capture his inner mind, we reshape him. We do not allow a dead man to rise up against us. You must love Big Brother before we kill you.'",
          "Room 101 contained the worst thing in the world, tailored specifically to each individual's deepest fear. For Winston, it was rats. Faced with the cage of starving rats, Winston did the one thing he swore he would never do: he betrayed Julia, begging them to do it to her instead.\n\nHis spirit was finally broken. Later, sitting in the Chestnut Tree Cafe, he looked up at the portrait of Big Brother. He had won the victory over himself. He loved Big Brother."
        ]
      }
    ]
  },
  11: {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    chapters: [
      {
        title: "Chapter 1: Maycomb County",
        pages: [
          "When he was nearly thirteen, my brother Jem got his arm badly broken at the elbow. When it healed and Jem's fears of never being able to play football were assuaged, he was seldom self-conscious about his injury. His left arm was somewhat shorter than his right; when he stood or walked, the back of his hand was at right angles to his body.\n\nBeing Southerners, it was source of shame to some members of the family that we had no recorded ancestors on either side of the Battle of Hastings. Our father Atticus Finch, a lawyer, lived in the tired old town of Maycomb. Maycomb was an old town, but it was a tired town when I first knew it. In rainy weather the streets turned to red slop; grass grew on the sidewalks, the courthouse sagged in the square.",
          "Somehow, it was hotter then: a black dog suffered on a summer's day; bony mules hitched to Hoover carts flicked flies in the sweltering shade. Men's stiff collars wilted by nine in the morning. Ladies bathed before noon, after their three-o'clock naps, and by nightfall were like soft teacakes with frostings of sweat and sweet talcum.\n\nWe lived on the main residential street—Jem, me, and our father Atticus, plus our cook Calpurnia. Jem and I found our father satisfactory: he played with us, read to us, and treated us with courteous detachment."
        ]
      },
      {
        title: "Chapter 2: Atticus's Defense",
        pages: [
          "Atticus Finch agreed to defend Tom Robinson, a Black man accused of a crime he did not commit. The town of Maycomb was outraged that Atticus would try to give him a fair defense. Jem and Scout faced insults from their classmates, but Atticus told them to keep their heads high.\n\nAtticus explained that you never really understand a person until you consider things from his point of view—until you climb into his skin and walk around in it. He taught his children that it is a sin to kill a mockingbird, because they don't do one thing but make music for us to enjoy.",
          "During the trial, Atticus systematically dismantled the prosecution's case. He proved that Tom could not have committed the assault, as his left arm was mangled and useless.\n\nDespite the clear evidence of Tom's innocence, the all-white jury found him guilty. It was a crushing blow to Jem and Scout's belief in justice, but Atticus calmly accepted the verdict, knowing that the fight for equality was a slow, painful struggle."
        ]
      },
      {
        title: "Chapter 3: Boo Radley",
        pages: [
          "For years, Jem, Scout, and their friend Dill were obsessed with Boo Radley, the mysterious neighbor who never left his house. They made up games and tried to peek through his windows. But in the end, Boo Radley turned out to be their savior.\n\nWhen Bob Ewell attacked the children in the dark, Boo Radley intervened and carried Jem home. Standing on the Radley porch, Scout finally understood Atticus's advice: she saw the neighborhood from Boo's perspective. Boo was just a gentle man who cared for his neighbors.",
          "Scout led Boo by the hand to the porch, and then he slipped away into the dark house. She never saw him again, but she knew he was always watching over them.\n\nAs she walked home, she reflected on Atticus's words. Most people are nice, Scout, when you finally see them. She climbed into bed, feeling safe and warm under Atticus's watchful eye."
        ]
      }
    ]
  },
  12: {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    chapters: [
      {
        title: "Chapter 1: Nick's Perspective",
        pages: [
          "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. 'Whenever you feel like criticizing any one,' he told me, 'just remember that all the people in this world haven't had the advantages that you've had.'\n\nHe didn't say any more, but we've always been unusually communicative in a reserved way. I understood that he meant a great deal more than that. I moved to Long Island Sound, renting a house next to a colossal mansion belonging to a mysterious man named Jay Gatsby, who spent his nights looking at a green light across the bay.",
          "The green light represented Gatsby's dream: Daisy Buchanan, his lost love, who lived across the water. Nick Carraway, the narrator, was Daisy's cousin, and Gatsby hoped to use Nick to reach her.\n\nNick observed the wealthy residents of West Egg and East Egg, noting the empty extravagance and moral decay of the Jazz Age. Gatsby stood apart from them, driven by a pure, romantic hope that bordered on madness."
        ]
      },
      {
        title: "Chapter 2: Gatsby's Parties",
        pages: [
          "Gatsby's house was filled with music and laughter every weekend. Hundreds of guests arrived to drink his champagne and dance on his lawns, though most of them had never met their host. They traded rumors about his past: that he was a German spy, an Oxford man, or a killer.\n\nGatsby threw these parties for one reason: he hoped that Daisy Buchanan, his lost love, would wander in one night. He had spent five years acquiring wealth and building a monument to a past that Daisy had already moved on from.",
          "When Gatsby and Daisy finally met at Nick's house, the reunion was tense and awkward. But soon, the old spark returned, and they began an affair.\n\nGatsby believed he could repeat the past, wiping out the five years they had spent apart. He demanded that Daisy tell her husband Tom that she never loved him, but Daisy could not bring herself to do it."
        ]
      },
      {
        title: "Chapter 3: The Illusion Fades",
        pages: [
          "In the end, Gatsby's dream was too grand to survive the harsh reality of the present. Daisy could not leave her husband Tom, and Gatsby was left waiting in his empty mansion. The hot summer ended in tragedy, leaving Gatsby dead in his swimming pool.\n\nNick Carraway reflected on Gatsby's capacity for hope. Gatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded us then, but that's no matter—tomorrow we will run faster, stretch out our arms farther... And one fine morning— So we beat on, boats against the current, borne back ceaselessly into the past.",
          "Tom and Daisy returned to their careless life, leaving others to clean up the mess they made. Nick decided to return to the Midwest, disgusted by the empty promises of the East.\n\nHe stood on the shore, looking out at the dark water. The green light was gone, but the dream of a better future remained, pulling us forward even as history drags us back."
        ]
      }
    ]
  },
  13: {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    chapters: [
      {
        title: "Chapter 1: An Unexpected Party",
        pages: [
          "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and a oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.\n\nIt had a perfectly round door like a porthole, painted green, with a shiny yellow brass knob in the exact middle. The hobbit was Bilbo Baggins, a respectable creature who never did anything unexpected. That was until Gandalf the Wizard arrived with thirteen dwarves, inviting him on an adventure to reclaim the Lonely Mountain.",
          "The dwarves, led by Thorin Oakenshield, filled Bilbo's kitchen and sang songs of lost gold and dragon fire. Bilbo was terrified, but a spark of adventure was lit in his Tookish blood.\n\nThey set out the next morning, Bilbo running without a pocket-handkerchief, beginning a journey that would take him through dark forests, over misty mountains, and into the shadow of the dragon Smaug."
        ]
      },
      {
        title: "Chapter 2: Riddles in the Dark",
        pages: [
          "Lost in the dark tunnels of the Misty Mountains, Bilbo stumbled upon a cold stone and put it in his pocket. Soon after, he met Gollum, a slimy creature who lived on a dark island in the middle of a subterranean lake. They played a game of riddles to determine Bilbo's fate.\n\nIf Bilbo won, Gollum would show him the way out. If he lost, Gollum would eat him. Bilbo won by asking, 'What have I got in my pocket?' Gollum failed to guess, and Bilbo discovered that the object in his pocket was a magic ring that made him invisible.",
          "Bilbo used the ring to escape Gollum and slip past the goblin guards. He rejoined the dwarves, who were amazed by his survival.\n\nThis ring would become Bilbo's greatest tool and his heaviest burden, connecting him to a larger destiny that would shape the history of Middle-earth."
        ]
      },
      {
        title: "Chapter 3: Smaug's Defeat",
        pages: [
          "Bilbo and the dwarves finally reached the Lonely Mountain, where the dragon Smaug slept on a massive pile of gold. Bilbo used his invisibility to steal a golden cup, waking the dragon in a furious rage. Smaug flew to destroy Laketown, but was shot down by Bard the Bowman.\n\nBilbo returned to his comfortable hobbit-hole, no longer the same respectable hobbit he once was. He had found his courage, made lifelong friends, and brought back a magic ring.",
          "His neighbors thought him queer and took to calling him 'mad Baggins,' but Bilbo did not care. He had seen the world and found his place in it.\n\nHe sat in his chair, blowing smoke rings and reflecting on his adventure, content to let the rest of the world go by."
        ]
      }
    ]
  },
  14: {
    title: "Harry Potter & the Sorcerer's Stone",
    author: "J.K. Rowling",
    chapters: [
      {
        title: "Chapter 1: The Boy Who Lived",
        pages: [
          "Mr. and Mrs. Dursley, of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much. They were the last people you'd expect to be involved in anything strange or mysterious, because they just didn't hold with such nonsense.\n\nHarry Potter lived with his aunt and uncle, sleeping in a dark cupboard under the stairs. He was treated poorly compared to his spoiled cousin Dudley. But on his eleventh birthday, a giant named Hagrid broke down their door and delivered a letter: Harry was a wizard, and he had a place at Hogwarts School of Witchcraft and Wizardry.",
          "Hagrid also revealed the truth about Harry's past: his parents had not died in a car crash, but had been killed by the dark wizard Voldemort. Harry had survived the attack, leaving him with a lightning-shaped scar on his forehead.\n\nThey traveled to Diagon Alley to buy books, a wand, and an owl named Hedwig. Harry was amazed to find that he was famous in the wizarding world."
        ]
      },
      {
        title: "Chapter 2: Hogwarts and Friends",
        pages: [
          "Harry boarded the Hogwarts Express from Platform Nine and Three-Quarters, meeting Ron Weasley and Hermione Granger. Hogwarts was a magical castle filled with moving staircases, ghosts, and flying broomsticks. Harry was sorted into Gryffindor house.\n\nHe quickly learned that Hogwarts was not just a school, but a place of secrets. He discovered a three-headed dog guarding a trapdoor on the third floor, guarding something valuable.",
          "Harry also joined the Gryffindor Quidditch team as a Seeker, becoming the youngest player in a century.\n\nHe spent his days learning spells, brewing potions, and exploring the castle with Ron and Hermione, feeling for the first time that he had found a home."
        ]
      },
      {
        title: "Chapter 3: The Mirror of Erised",
        pages: [
          "Harry discovered a mirror that showed the deepest desire of his heart: his parents standing beside him. Dumbledore warned him that the mirror did not show truth or knowledge, and that men had wasted away before it.\n\nHarry, Ron, and Hermione solved a series of magical obstacles to protect the Sorcerer's Stone from Voldemort. In the final chamber, Harry faced Professor Quirrell and Voldemort's face on the back of Quirrell's head. By using the mirror, Harry obtained the stone and defeated Quirrell, saving Hogwarts.",
          "Voldemort's spirit fled, and Harry woke up in the hospital wing, surrounded by Dumbledore and cards from his friends.\n\nAt the end-of-term feast, Gryffindor won the House Cup. Harry returned to the Dursleys for the summer, knowing that he would return to Hogwarts in the fall."
        ]
      }
    ]
  },
  15: {
    title: "The Lightning Thief (Percy Jackson)",
    author: "Rick Riordan",
    chapters: [
      {
        title: "Chapter 1: The Pre-Algebra Teacher",
        pages: [
          "Look, I didn't want to be a half-blood. If you're reading this because you think you might be one, my advice is: close this book right now. Believe whatever lie your mom or dad told you about your birth, and try to lead a normal life. Being a half-blood is dangerous. It's scary. Most of the time, it gets you killed in painful, nasty ways.\n\nMy name is Percy Jackson. I was a twelve-year-old boarder student at Yancy Academy, a school for troubled kids in upstate New York. I had dyslexia and ADHD, and trouble seemed to find me wherever I went. That became very clear when my math teacher turned into a winged monster and attacked me on a field trip.",
          "My friend Grover and my mother Sally had to rush me away to Camp Half-Blood. On the way, we were attacked by the Minotaur. Percy managed to defeat it, but his mother vanished in a flash of light.\n\nPercy woke up in the camp infirmary, discovering a world where Greek mythology was real, and he was the son of Poseidon, god of the sea."
        ]
      },
      {
        title: "Chapter 2: Camp Half-Blood",
        pages: [
          "Percy discovered that his father was Poseidon, the Greek god of the sea. His mother had sent him to Camp Half-Blood, a training ground for demigods in Long Island. There, he met Chiron the centaur and Grover, who was actually a satyr.\n\nPercy was accused of stealing Zeus's master bolt, the most powerful weapon in the universe. To prevent a war between the gods, Percy had to embark on a quest to find the real thief and return the bolt to Mount Olympus within ten days.",
          "He was joined by Annabeth Chase, daughter of Athena, and Grover. They set out across the United States, facing monsters at every turn.\n\nPercy learned to use his water powers, controlling waves and healing himself in rivers, growing stronger as they approached their destination."
        ]
      },
      {
        title: "Chapter 3: The Underworld and Back",
        pages: [
          "Percy, Annabeth, and Grover traveled to the Underworld in Los Angeles, facing monsters like Medusa and the chimera along the way. They discovered that Ares, the god of war, had manipulated them and hidden the bolt in Percy's backpack.\n\nPercy defeated Ares in a duel on the beach, reclaimed the helm of darkness for Hades, and flew to New York to return the master bolt to Zeus. He saved the world from a catastrophic war and returned to camp a hero, ready for whatever the gods had in store next.",
          "He returned to Yancy Academy, but the memory of Camp Half-Blood remained, a promise of a larger world and greater adventures.\n\nHe knew his journey was far from over. The demigod life was dangerous, but he was ready to face whatever lay ahead."
        ]
      }
    ]
  }
};

export default bookContents;
