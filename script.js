// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Theme toggle (remembers choice; falls back to system preference)
const root = document.documentElement;
document.getElementById('themeToggle').addEventListener('click', () => {
  const current = root.dataset.theme ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
});

// Hero slideshow: 1 -> 2 -> 3 -> 4, linger on 4, then start over
(() => {
  const slides = document.querySelectorAll('#slideshow img');
  const holdMs = [1500, 1500, 1500, 5000];
  let i = 0;
  if (reducedMotion) {
    slides.forEach((s, k) => s.classList.toggle('active', k === slides.length - 1));
    return;
  }
  const advance = () => {
    slides[i].classList.remove('active');
    i = (i + 1) % slides.length;
    slides[i].classList.add('active');
    setTimeout(advance, holdMs[i]);
  };
  setTimeout(advance, holdMs[0]);
})();

// Minimal Lean 4 syntax highlighter
const escapeHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const LEAN_TOKENS = new RegExp([
  /(\/-[\s\S]*?-\/|--[^\n]*)/.source,                                                     // 1 comments
  /\b(theorem|lemma|def|structure|class|instance|where|namespace|end|open|import|by|fun|have|with|deriving)\b/.source, // 2 keywords
  /\b(induction|intro|obtain|exact|refine|rcases|simp|simpa|omega|decide|rfl|unfold|rw|cases|push|calc)\b/.source,      // 3 tactics
  /([∀∃¬→↔⟨⟩∈∉≠≤∧∨ℕ])/.source,                                                           // 4 symbols
].join('|'), 'g');
function highlightLean(src) {
  let out = '', last = 0;
  for (const m of src.matchAll(LEAN_TOKENS)) {
    out += escapeHtml(src.slice(last, m.index));
    const cls = m[1] ? 'cmt' : m[2] ? 'kw' : m[3] ? 'tac' : 'sym';
    out += `<span class="${cls}">${escapeHtml(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + escapeHtml(src.slice(last));
}
document.querySelectorAll('code[data-lean]').forEach(el => { el.innerHTML = highlightLean(el.textContent); });

// Side-rail excerpts, taken from github.com/KyeYongChoo/fyp_scheduling_algorithms
const LEAN_LEFT = String.raw`structure AperiodicProcess where
  id        : Nat
  arrival   : Nat
  burst     : Nat
  remaining : Nat
  burst_exceed_zero : burst > 0

/-- A scheduler is starvation-free
when every process that ever arrives
eventually turns up in completed. -/
def StarvationFreeRun
    (run : (ℕ → List AperiodicProcess)
      → ℕ → SchedState) : Prop :=
  ∀ arrival_stream,
    WellFormedStream arrival_stream →
    ∀ arrival_time process,
      process ∈ arrival_stream arrival_time →
      ∃ completion_time,
      ∃ finished ∈ (run arrival_stream
          completion_time).completed,
        Process.id finished =
          Process.id process

theorem not_starvationFree :
    ¬ StarvationFree stepSJF := by
  intro h_starvation_free
  obtain ⟨t, p, h_mem, h_id⟩ :=
    h_starvation_free starvation_stream
      starvation_stream_wf 0 victim
      (by simp [starvation_stream])
  exact (starvation_stream_invariant t)
    .2.2 p h_mem
    (by simpa [victim] using h_id)

theorem fcfs_hasConvoyEffect :
    HasConvoyEffect selectFCFS :=
  (hasConvoyEffect_iff _).mpr
    ⟨[leader, shortJob], by simp,
      leader, by simp, rfl,
      shortJob, by simp, by decide⟩

-- Round Robin degenerates to FCFS
-- once quantum ≥ the long burst
theorem rr_convoy_eq_fcfs
    (quantum L : ℕ) (hL : 0 < L)
    (hq : L ≤ quantum) :
    (runStepsRR quantum
      (convoyArrivalStream L hL) L)
      .sched.running =
    (runSteps (convoyArrivalStream L hL)
      stepFCFS L).running := by
  have h := rr_convoy_dispatch
    quantum L (by omega) hL
  rw [min_eq_right hq] at h
  exact h
`;

const LEAN_RIGHT = String.raw`/-- The heart of the argument. -/
theorem starvation_stream_invariant
    (t : ℕ) :
    (runSteps starvation_stream
      stepSJF t).ready = [victim] ∧
    (runSteps starvation_stream
      stepSJF t).running
        = some (flood t) ∧
    ∀ p ∈ (runSteps starvation_stream
      stepSJF t).completed,
        p.id ≠ 0 := by
  induction t with
  | zero =>
    refine ⟨?_, ?_, ?_⟩ <;>
      simp [runSteps, stepSJF,
        selectSJF, victim, flood]
  | succ t ih =>
    obtain ⟨ih_ready, ih_running,
      ih_completed⟩ := ih
    simp only [runSteps,
      starvation_stream,
      ih_ready, ih_running]
    refine ⟨?_, ?_, ?_⟩
    · simp
    · simp
    · intro p hp
      rcases hp with hp | rfl
      · exact ih_completed p hp
      · simp

theorem fcfs_convoy_invariant
    (L : ℕ) (hL : 0 < L)
    (t : ℕ) (ht : t < L) :
    (runSteps (convoyArrivalStream L hL)
      stepFCFS t).running =
        some { longJob L hL with
          remaining := L - t } ∧
    (runSteps (convoyArrivalStream L hL)
      stepFCFS t).ready = [shortJob] := by
  induction t with
  | zero =>
    simp [runSteps, stepFCFS,
      stepNonPreemptive, selectFCFS,
      convoyArrivalStream, longJob]
  | succ t ih =>
    obtain ⟨ih_running, ih_ready⟩ :=
      ih (by omega)
    have h1 : ¬ L - t - 1 ≤ 0 := by
      omega
    simp [h1]
    omega

theorem idle_implies_empty_ready
  (arrival_stream : ℕ → List
    AperiodicProcess)
  (t quantum : ℕ)
  (h_running :
    (runStepsRR quantum
      arrival_stream t).sched.running
      = none) :
  (runStepsRR quantum arrival_stream
    t).sched.ready = [] := by
  induction t with
`;

document.querySelectorAll('.lean-rail').forEach(rail => {
  const src = rail.classList.contains('left') ? LEAN_LEFT : LEAN_RIGHT;
  const html = highlightLean(src);
  // Content is doubled so the -50% scroll animation loops seamlessly
  rail.querySelector('.lean-scroll').innerHTML = html + '\n' + html + '\n';
});

// Project filters
const filters = document.querySelectorAll('.filter');
const projects = document.querySelectorAll('.project');
filters.forEach(btn => btn.addEventListener('click', () => {
  filters.forEach(b => b.classList.toggle('active', b === btn));
  const f = btn.dataset.filter;
  projects.forEach(p => {
    const cats = p.dataset.cat.split(' ');
    p.classList.toggle('hidden', f !== 'all' && !cats.includes(f));
  });
}));

// Reveal sections on scroll + highlight active nav link
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('.section');
sections.forEach(s => s.classList.add('reveal'));
const navIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.05 });
sections.forEach(s => { navIO.observe(s); revealIO.observe(s); });
