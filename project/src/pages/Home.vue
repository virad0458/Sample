<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <div class="bg-[#1F1F1F] text-white p-4 shadow-md">
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <div class="flex items-center space-x-4">
          <!-- Ensure this path is correct for your project structure -->
          <img src="@/assets/dost-logo.png" alt="DOST SciNet-Phil Logo" class="h-12 w-50" />
          <div>
            <div class="text-xl font-bold">DOST UNION CATALOG</div>
            <div class="text-sm border-l border-white pl-4 ml-4 leading-tight">
              LitPath AI: <br /> Smart PathFinder of Theses and Dissertation
            </div>
          </div>
        </div>
        <!-- Navigation / Profile -->
        <div class="flex items-center space-x-6 relative">
          <a
            href="http://scinet.dost.gov.ph/#/opac"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-blue-200 transition-colors hidden md:block"
          >
            Online Public Access Catalog
          </a>
          <!-- Using router-link for internal navigation if you add other pages -->
          <router-link to="/" class="font-bold text-blue-400">
            LitPath AI
          </router-link>
          
          <!-- Profile Icon (Click to go to login if you have one) -->
          <div class="relative">
            <router-link 
              to="/login" 
              class="bg-white text-[#1E74BC] rounded-full p-2 hover:bg-gray-200 transition-colors flex items-center"
            >
              <UserIcon :size="24" />
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Backend Status Indicator -->
    <div 
      v-if="backendStatus"
      :class="[
        'px-4 py-2 text-center text-sm',
        backendStatus.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      ]"
    >
      <span v-if="backendStatus.status === 'healthy'">
         ✓ Backend connected - {{ backendStatus.total_documents }} documents, {{ backendStatus.total_chunks }} chunks indexed
      </span>
      <span v-else>
         ⚠ {{ backendStatus.message }}
      </span>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col md:flex-row justify-center items-start py-10 px-4 gap-6 max-w-7xl mx-auto">
      <!-- Left Container (Sidebar) -->
      <div class="w-full md:w-80 bg-white bg-opacity-95 rounded-xl shadow-2xl p-6 flex-shrink-0 h-auto">
        <div class="flex items-center space-x-2 mb-6 text-gray-800">
          <BookOpenIcon class="text-[#1E74BC]" :size="24" />
          <span class="font-bold text-xl">LitPath AI</span>
        </div>
        <button
          @click="handleNewChat"
          class="w-full bg-[#1E74BC] text-white py-3 px-4 rounded-lg mb-8 hover:bg-[#155a8f] transition-colors font-semibold shadow-md flex items-center justify-center"
        >
          Start a new chat
        </button>
        <div class="mb-8">
          <h3 class="font-semibold text-gray-800 mb-3 text-lg">Research history</h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            After you start a new chat, your research history will be displayed here.
          </p>
        </div>
        <div class=" md:absolute md:bottom-6 md:left-6 md:right-6 text-xs text-gray-500 space-y-2 mt-auto">
          <p>AI-generated content. Quality may vary.<br />Check for accuracy.</p>
        </div>
      </div>

      <!-- Right Container (Main Content) -->
      <div class="flex-1 w-full bg-white bg-opacity-95 rounded-xl shadow-2xl p-8 min-h-[80vh]">
        <!-- WELCOME SCREEN -->
        <div v-if="!searchResults" class="max-w-4xl mx-auto">
          <div class="text-center mb-10 mt-8">
            <div class="flex items-center justify-center space-x-3 mb-4">
               <h1 class="text-5xl font-extrabold">
                <span class="text-[#1E74BC]">LitPath</span>
                <span class="text-[#b83a3a]">AI</span>
              </h1>
            </div>
            <p class="text-gray-700 text-xl">Discover easier and faster.</p>
          </div>

          <!-- Search Box and Filters -->
          <div class="bg-white rounded-lg shadow-inner p-6 mb-8 border border-gray-200">
            <div class="flex items-center space-x-3 mb-4 border border-gray-300 rounded-lg p-2 focus-within:border-blue-500 transition-colors bg-white">
              <SearchIcon class="text-gray-500 ml-2" :size="22" />
              <input
                type="text"
                placeholder="What is your research question?"
                class="flex-1 outline-none text-gray-800 text-lg py-2 px-2"
                v-model="searchQuery"
                @keypress.enter="handleSearch(searchQuery)"
              />
              <button
                @click="handleSearch(searchQuery)"
                class="bg-[#1E74BC] text-white p-3 rounded-lg hover:bg-[#155a8f] transition-colors disabled:opacity-50"
                :disabled="loading"
              >
                <ArrowRightIcon :size="20" />
              </button>
            </div>

            <!-- FILTERS -->
            <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <!-- Subject Filter -->
              <div class="relative w-full md:w-1/2" ref="subjectDropdownRef">
                <button
                  @click="showSubjectDropdown = !showSubjectDropdown"
                  class="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-left flex justify-between items-center hover:bg-gray-200 transition-colors"
                >
                  <span class="text-gray-700 truncate">{{ selectedSubject }}</span>
                  <ChevronDownIcon :size="20" :class="['text-gray-500 transition-transform', showSubjectDropdown ? 'rotate-180' : '']" />
                </button>
                <div v-if="showSubjectDropdown" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div
                    v-for="(subject, index) in subjects"
                    :key="index"
                    @click="selectSubject(subject)"
                    class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-800"
                  >
                    {{ subject }}
                  </div>
                </div>
              </div>

              <!-- Date Filter -->
              <div class="relative w-full md:w-1/2" ref="dateDropdownRef">
                <button
                  @click="showDateDropdown = !showDateDropdown"
                  class="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-left flex justify-between items-center hover:bg-gray-200 transition-colors"
                >
                  <span class="text-gray-700">{{ selectedDate }}</span>
                  <ChevronDownIcon :size="20" :class="['text-gray-500 transition-transform', showDateDropdown ? 'rotate-180' : '']" />
                </button>
                <div v-if="showDateDropdown" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div
                    v-for="(option, index) in dateOptions"
                    :key="index"
                    @click="selectDate(option)"
                    class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-800"
                  >
                    {{ option }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Custom Date Range -->
            <div v-if="selectedDate === 'Custom date range'" class="flex space-x-4 mt-4">
              <input
                type="number"
                placeholder="From (Year)"
                v-model="fromYear"
                class="w-1/2 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="To (Year)"
                v-model="toYear"
                class="w-1/2 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center text-[#1E74BC] text-lg mt-8 flex justify-center items-center">
             <RefreshCwIcon class="animate-spin mr-2" :size="24" />
             Searching for insights...
          </div>

          <!-- Error State -->
          <div v-if="error" class="text-center text-red-600 text-lg mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
            {{ error }}
            <div v-if="backendStatus?.status === 'error'" class="mt-2 text-sm">
               Make sure your backend is running on {{ API_BASE_URL }}
            </div>
          </div>

          <!-- Example Questions -->
          <div class="mt-12">
            <h3 class="text-xl font-semibold text-gray-800 mb-5">Example questions</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <button
                v-for="(question, index) in exampleQuestions"
                :key="index"
                @click="handleExampleQuestionClick(question)"
                class="flex items-center justify-between text-left p-5 bg-gray-50 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-gray-800 hover:bg-blue-50 hover:border-blue-300 group"
              >
                <span class="flex-1 pr-4">{{ question }}</span>
                <ArrowRightIcon :size="22" class="text-[#1E74BC] flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <!-- RESULTS SCREEN -->
        <div v-else class="max-w-6xl mx-auto">
           <!-- Persistent Search Input -->
            <div class="bg-white rounded-lg shadow-inner p-4 mb-8 border border-gray-200 flex items-center space-x-3">
                 <SearchIcon class="text-gray-500 ml-2" :size="20" />
                 <input
                    type="text"
                    placeholder="What is your research question?"
                    class="flex-1 outline-none text-gray-800 text-lg py-1"
                    v-model="searchQuery"
                    @keypress.enter="handleSearch(searchQuery)"
                  />
                  <button
                    @click="handleSearch(searchQuery)"
                    class="bg-[#1E74BC] text-white p-2 rounded-lg hover:bg-[#155a8f] transition-colors"
                  >
                    <ArrowRightIcon :size="20" />
                  </button>
            </div>

          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ searchResults.query }}</h2>
          </div>

          <!-- Sources Carousel -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold mb-4 flex items-center space-x-3 text-gray-800">
              <BookOpenIcon :size="24" class="text-[#1E74BC]" />
              <span>Sources</span>
            </h3>
            <div class="flex space-x-5 overflow-x-auto pb-4">
              <div
                v-for="(source, index) in searchResults.sources"
                :key="source.id"
                @click="handleSourceClick(source)"
                :class="[
                  'flex-shrink-0 w-72 bg-white rounded-xl shadow-lg p-5 cursor-pointer border-2 transition-all duration-200 ease-in-out hover:shadow-xl',
                  selectedSource && selectedSource.id === source.id ? 'border-blue-500' : 'border-gray-100'
                ]"
              >
                <div class="flex items-center justify-center w-9 h-9 bg-[#1E74BC] text-white rounded-full mb-3 text-base font-bold">
                  {{ index + 1 }}
                </div>
                <h4 class="font-semibold text-lg text-gray-800 mb-2 line-clamp-3">{{ source.title }}</h4>
                <p class="text-sm text-gray-600">{{ source.author }} • {{ source.year }}</p>
              </div>
            </div>
          </div>

          <!-- Selected Source Details Preview -->
          <div v-if="selectedSource" class="bg-[#E8F3FB] border-l-4 border-[#1E74BC] rounded-r-lg p-6 mb-8 shadow-md">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-bold text-[#1E74BC]">{{ selectedSource.title }}</h3>
              <button @click="selectedSource = null" class="text-gray-500 hover:text-gray-700 transition-colors text-2xl leading-none">
                ×
              </button>
            </div>
            <p class="text-md text-gray-700 mb-4">{{ selectedSource.author }} • {{ selectedSource.year }}</p>
            <div class="mb-4">
              <h4 class="font-semibold text-lg mb-2 text-gray-800">Abstract:</h4>
              <p class="text-base text-gray-700 leading-relaxed">
                 {{ getTruncatedAbstract(selectedSource.abstract) }}
              </p>
            </div>
            <button
              @click="showOverlay = true"
              class="bg-gray-800 text-white px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              More details and request options
            </button>
          </div>

          <!-- Overview of Sources (AI Generated) -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                 <SparklesIcon class="mr-2 text-[#1E74BC]" :size="24" /> AI Research Overview
            </h3>
            <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <!-- Using v-html for the rich text with citations -->
              <div class="text-gray-700 leading-relaxed whitespace-pre-line text-base" v-html="formattedOverview"></div>
            </div>
          </div>

          <!-- Related Questions -->
          <div v-if="searchResults.relatedQuestions.length > 0">
            <h3 class="text-xl font-semibold text-gray-800 mb-5">Related research questions</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <button
                v-for="(question, index) in searchResults.relatedQuestions"
                :key="index"
                @click="handleExampleQuestionClick(question)"
                class="flex items-center justify-between text-left p-5 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-blue-600 hover:text-blue-800 hover:bg-blue-50 hover:border-blue-300"
              >
                <span>{{ question }}</span>
                <ArrowRightIcon :size="20" class="text-[#1E74BC] flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay for More Details -->
    <div v-if="showOverlay && selectedSource" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-end">
       <!-- Clicking outside closes it -->
      <div class="absolute inset-0" @click="showOverlay = false"></div>
      
      <div class="relative w-full md:w-2/3 lg:w-1/2 bg-white h-full overflow-y-auto shadow-2xl animate-slide-in">
        <div class="text-white p-6 shadow-md sticky top-0 z-10" style="background-color: #1E74BC">
          <button @click="showOverlay = false" class="text-white hover:text-blue-200 text-sm flex items-center space-x-2 mb-4">
            <ArrowLeftIcon :size="18" />
            <span>Back to results</span>
          </button>
          <h2 class="text-2xl font-bold leading-tight">{{ selectedSource.title }}</h2>
        </div>

        <div class="p-8">
          <div class="space-y-4 mb-8 text-gray-700 bg-gray-50 p-6 rounded-xl">
            <div class="flex items-center space-x-2">
              <span class="font-semibold text-gray-800 min-w-[100px]">Degree:</span>
              <span>{{ selectedSource.degree }}</span>
            </div>
            <div class="flex items-center space-x-2">
               <UserIcon :size="16" class="text-gray-500" />
              <span class="font-semibold text-gray-800 min-w-[80px]">Author:</span>
              <span>{{ selectedSource.author }}</span>
            </div>
            <div class="flex items-center space-x-2">
               <CalendarIcon :size="16" class="text-gray-500" />
              <span class="font-semibold text-gray-800 min-w-[80px]">Year:</span>
              <span>{{ selectedSource.year }}</span>
            </div>
             <div class="flex items-start space-x-2">
               <BookOpenIcon :size="16" class="text-gray-500 mt-1" />
              <span class="font-semibold text-gray-800 min-w-[80px]">Institution:</span>
              <span>{{ selectedSource.school }}</span>
            </div>
            <div>
              <span class="font-semibold text-gray-800">Subject/s:</span>
              <div class="ml-5 mt-1 text-gray-600">
                <ul v-if="formattedSubjects.length > 0" class="list-disc pl-4">
                    <li v-for="(sub, i) in formattedSubjects" :key="i">{{ sub }}</li>
                </ul>
                <div v-else>N/A</div>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-200 text-blue-900 p-6 rounded-md shadow-sm mb-8">
            <div class="text-base leading-relaxed">
              <div class="font-semibold">STII Bldg., Gen. Santos Ave., Upper Bicutan,</div>
              <div>Taguig City, Metro Manila, 1631, Philippines</div>
              <div class="mt-3 font-medium flex items-center"><MailIcon :size="16" class="mr-2"/> library@stii.dost.gov.ph</div>
              <div class="mt-2 font-medium">Full text available at DOST-STII Library from 8am - 5pm</div>
            </div>
          </div>

          <div>
            <h3 class="font-semibold text-lg mb-3 text-gray-800 uppercase tracking-wider border-b pb-2">Abstract</h3>
            <p class="text-base text-gray-700 leading-relaxed whitespace-pre-line">{{ selectedSource.abstract }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import {
  Search as SearchIcon,
  ChevronDown as ChevronDownIcon,
  BookOpen as BookOpenIcon,
  User as UserIcon,
  Calendar as CalendarIcon,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
  RefreshCw as RefreshCwIcon,
  Mail as MailIcon,
  Sparkles as SparklesIcon
} from 'lucide-vue-next';

export default {
  name: 'LitPathAI',
  components: {
    SearchIcon,
    ChevronDownIcon,
    BookOpenIcon,
    UserIcon,
    CalendarIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    RefreshCwIcon,
    MailIcon,
    SparklesIcon
  },
  data() {
    return {
      API_BASE_URL: 'http://localhost:5000',
      searchQuery: '',
      selectedSubject: 'All subjects',
      selectedDate: 'All dates',
      showSubjectDropdown: false,
      showDateDropdown: false,
      fromYear: '',
      toYear: '',
      searchResults: null,
      selectedSource: null,
      showOverlay: false,
      loading: false,
      error: null,
      backendStatus: null,
      subjects: [
        "All subjects", "Agriculture", "Anthropology", "Applied Sciences", "Architecture",
        "Arts and Humanities", "Biological Sciences", "Business", "Chemistry",
        "Communication and Media", "Computer Science", "Cultural Studies", "Economics",
        "Education", "Engineering", "Environmental Science", "Geography", "History",
        "Law", "Library and Information Science", "Linguistics", "Literature",
        "Mathematics", "Medicine and Health Sciences", "Philosophy", "Physics",
        "Political Science", "Psychology", "Social Sciences", "Sociology",
      ],
      dateOptions: ['All dates', 'Last year', 'Last 3 years', 'Custom date range'],
      exampleQuestions: [
          "How does plastic pollution affect plant growth in farmland?",
          "Find research about sleep quality among teenagers",
          "How does remote work impact employee productivity?",
          "Find recent research about how vitamin D deficiency impact overall health"
      ]
    };
  },
  computed: {
    // Pre-process the overview HTML to add styling to citations [1], [2]
    formattedOverview() {
      if (!this.searchResults?.overview) return "<i>No overview available.</i>";
      
      return this.searchResults.overview.replace(/ \[ (\d+) \] /g, (_, num) => {
        return `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1E74BC] text-white text-xs font-bold mx-0.5 relative -top-1">${num}</span>`;
      });
    },
    // Helper for displaying subjects in the overlay
    formattedSubjects() {
        if (!this.selectedSource) return [];
        let subs = this.selectedSource.subjects;
        if (Array.isArray(subs)) return subs;
        if (typeof subs === 'string' && subs.trim() !== '') {
            return subs.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
    }
  },
  mounted() {
    this.checkBackendHealth();
    document.addEventListener('mousedown', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  },
  methods: {
    handleClickOutside(event) {
      if (this.$refs.subjectDropdownRef && !this.$refs.subjectDropdownRef.contains(event.target)) {
        this.showSubjectDropdown = false;
      }
      if (this.$refs.dateDropdownRef && !this.$refs.dateDropdownRef.contains(event.target)) {
        this.showDateDropdown = false;
      }
    },
    async checkBackendHealth() {
      try {
        const response = await fetch(`${this.API_BASE_URL}/health`);
        if (response.ok) {
          this.backendStatus = await response.json();
        } else {
          this.backendStatus = { status: 'error', message: 'Backend not responding' };
        }
      } catch (err) {
        console.error("Backend health check failed:", err);
        this.backendStatus = { status: 'error', message: 'Cannot connect to backend' };
      }
    },
    async handleSearch(query = this.searchQuery) {
      if (!query.trim()) {
        this.error = "Please enter a research question.";
        return;
      }
      if (!this.backendStatus || this.backendStatus.status === 'error') {
         // Optional: Remove this if you don't want to block searching when backend is down during dev
         // this.error = "Backend service is not available.";
         // return;
         console.warn("Attempting search even though backend health check failed...");
      }

      this.loading = true;
      this.error = null;
      this.searchResults = null;
      this.selectedSource = null;

      try {
        const response = await fetch(`${this.API_BASE_URL}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: query,
            subject: this.selectedSubject === 'All subjects' ? null : this.selectedSubject,
            dateFilter: this.selectedDate,
            fromYear: this.selectedDate === 'Custom date range' ? this.fromYear : null,
            toYear: this.selectedDate === 'Custom date range' ? this.toYear : null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        this.searchResults = {
          query: query,
          overview: data.overview || 'No overview available.',
          // Map response to UI-friendly format
          sources: data.documents.map((doc, index) => ({
            id: index + 1,
            title: doc.title || '[Unknown Title]',
            author: doc.author || '[Unknown Author]',
            year: doc.publication_year || '[Unknown Year]',
            abstract: doc.abstract || 'Abstract not available.',
            fullTextPath: doc.file || '',
            degree: doc.degree || 'Thesis',
            subjects: doc.subjects || ['Research'],
            school: doc.university || '[Unknown University]',
          })),
          relatedQuestions: data.related_questions || [],
        };
      } catch (err) {
        console.error("Search failed:", err);
        this.error = `Search failed: ${err.message}`;
      } finally {
        this.loading = false;
      }
    },
    handleExampleQuestionClick(question) {
      this.searchQuery = question;
      this.handleSearch(question);
    },
    handleSourceClick(source) {
      this.selectedSource = source;
    },
    handleNewChat() {
      this.searchQuery = '';
      this.selectedSubject = 'All subjects';
      this.selectedDate = 'All dates';
      this.fromYear = '';
      this.toYear = '';
      this.searchResults = null;
      this.selectedSource = null;
      this.showOverlay = false;
      this.loading = false;
      this.error = null;
    },
    selectSubject(subject) {
      this.selectedSubject = subject;
      this.showSubjectDropdown = false;
    },
    selectDate(option) {
      this.selectedDate = option;
      this.showDateDropdown = false;
    },
    getTruncatedAbstract(abstract) {
        if (!abstract) return '';
        // Split by period followed by space to approximate sentences
        const sentences = abstract.split(/(?<=\. )\s+/);
        if (sentences.length <= 3) return abstract;
        return sentences.slice(0, 3).join(" ") + " ...";
    }
  }
};
</script>

<style scoped>
/* Utility for hiding scrollbars but keeping functionality */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}

/* Simple slide-in animation for overlay */
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.animate-slide-in {
  animation: slideInRight 0.3s ease-out forwards;
}
</style>