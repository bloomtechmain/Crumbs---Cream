import { useState, useEffect, useMemo, useRef } from 'react';
import { Cake, ImagePlus, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { CAKE_SIZES, CAKE_FLAVOURS, OTHER_FLAVOUR } from '../../data/cakes';
import { mailtoLink, formatPrice, submitCakeEnquiry } from './orderSummary';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PHOTOS = 5;
const MAX_PHOTO_EDGE = 1600; // px — plenty for a design reference, keeps uploads small

const inputClass = 'w-full border border-brown-200 rounded-sm px-3 py-2.5 text-brown-700 focus:outline-none focus:border-brown-500';

// Earliest selectable date: tomorrow, in the customer's local time.
function minDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Re-encodes a photo as a JPEG no larger than MAX_PHOTO_EDGE on its long side,
// so phone photos (often 5MB+) upload quickly. Falls back to the original file
// if the browser can't decode it.
async function compressPhoto(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-600 text-xs mt-1.5">{message}</p>;
}

function StepLabel({ number, children }) {
  return (
    <p className="block text-sm font-semibold text-brown-700 mb-2">
      <span className="text-brown-400 mr-1">{number}.</span> {children}
    </p>
  );
}

export default function CustomCakeForm() {
  const [size, setSize] = useState(CAKE_SIZES[0].key);
  const [flavour, setFlavour] = useState('');
  const [otherFlavour, setOtherFlavour] = useState('');
  const [date, setDate] = useState('');
  const [details, setDetails] = useState('');
  const [photos, setPhotos] = useState([]); // [{ id, file, preview }]
  const [fulfilment, setFulfilment] = useState('pickup');
  const [address, setAddress] = useState('');
  const [allergies, setAllergies] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const nextPhotoId = useRef(1);
  const formTopRef = useRef(null);

  // Release preview object URLs when photos are removed or the form unmounts.
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  const selectedSize = CAKE_SIZES.find((s) => s.key === size);
  const flavourText = flavour === OTHER_FLAVOUR ? `Other — ${otherFlavour.trim()}` : flavour;

  const errors = useMemo(() => {
    const e = {};
    if (!flavour) e.flavour = 'Please choose a flavour.';
    else if (flavour === OTHER_FLAVOUR && !otherFlavour.trim()) e.flavour = 'Tell us which flavour you have in mind.';
    if (!date) e.date = 'Please choose a preferred date.';
    else if (date < minDate()) e.date = 'Please choose a date from tomorrow onwards.';
    if (!details.trim()) e.details = 'Please describe your cake design.';
    if (fulfilment === 'delivery' && !address.trim()) e.address = 'Please enter your delivery address.';
    if (!name.trim()) e.name = 'Please enter your name.';
    if (!EMAIL_RE.test(email.trim())) e.email = 'Please enter a valid email address.';
    if (!phone.trim()) e.phone = 'Please enter your phone number.';
    if (!acknowledged) e.acknowledged = 'Please confirm you understand this is an enquiry.';
    return e;
  }, [flavour, otherFlavour, date, details, fulfilment, address, name, email, phone, acknowledged]);

  const err = (key) => (showErrors ? errors[key] : undefined);

  const summary = [
    `Hi! I'd like to enquire about a custom cake:`,
    `Size: ${selectedSize.label} (${selectedSize.servings})`,
    `Flavour: ${flavourText || '(not chosen)'}`,
    `Preferred date: ${date || '(not chosen)'}`,
    `Design details: ${details.trim() || '(not provided)'}`,
    `Fulfilment: ${fulfilment === 'pickup' ? 'Pickup' : 'Delivery'}`,
    ...(fulfilment === 'delivery' ? [`Delivery address: ${address.trim() || '(not provided)'}`] : []),
    `Allergies / dietary requirements: ${allergies.trim() || 'None'}`,
    '',
    `Name: ${name.trim()}`,
    `Email: ${email.trim()}`,
    `Phone: ${phone.trim()}`,
  ].join('\n');

  const addPhotos = async (fileList) => {
    const room = MAX_PHOTOS - photos.length;
    const picked = Array.from(fileList).filter((f) => f.type.startsWith('image/')).slice(0, room);
    const compressed = await Promise.all(picked.map(compressPhoto));
    setPhotos((ps) => [
      ...ps,
      ...compressed.map((file) => ({ id: nextPhotoId.current++, file, preview: URL.createObjectURL(file) })),
    ]);
  };

  const removePhoto = (id) => {
    setPhotos((ps) => {
      const target = ps.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return ps.filter((p) => p.id !== id);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setStatus('sending');
    try {
      await submitCakeEnquiry(summary, photos.map((p) => p.file));
      setStatus('sent');
    } catch (ex) {
      setErrorMessage(ex.message === 'Enquiry request failed' ? '' : ex.message);
      setStatus('error');
    }
  };

  const resetForm = () => {
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setSize(CAKE_SIZES[0].key);
    setFlavour('');
    setOtherFlavour('');
    setDate('');
    setDetails('');
    setPhotos([]);
    setFulfilment('pickup');
    setAddress('');
    setAllergies('');
    setAcknowledged(false);
    setShowErrors(false);
    setStatus('idle');
  };

  if (status === 'sent') {
    return (
      <div className="text-center py-10">
        <CheckCircle2 size={44} className="mx-auto text-brown-500 mb-4" strokeWidth={1.5} />
        <h3 className="font-serif text-2xl font-bold text-brown-800 mb-2">Thank you, your cake enquiry is sent!</h3>
        <p className="text-brown-500 max-w-md mx-auto mb-6">
          This isn't an order confirmation yet. We'll be in touch at {email.trim()} to confirm availability,
          pricing and next steps.
        </p>
        <button type="button" onClick={resetForm} className="btn-outline">Start Another Enquiry</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div ref={formTopRef} className="flex items-start gap-4 mb-6 scroll-mt-28">
        <div className="w-14 h-14 rounded-full bg-cream-100 border border-brown-100 flex items-center justify-center flex-shrink-0">
          <Cake size={26} className="text-brown-500" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-serif text-2xl font-bold text-brown-800 mb-1">Build Your Cake</h3>
          <p className="text-brown-400 text-sm">
            Custom cakes for birthdays, gifting, corporate functions and special celebrations. Tell us what
            you'd like and we'll get back to you with a quote.
          </p>
        </div>
      </div>

      {showErrors && Object.keys(errors).length > 0 && (
        <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          Please fill in the highlighted fields below.
        </p>
      )}

      {/* 1. Size */}
      <fieldset className="mb-6">
        <legend><StepLabel number={1}>Select your cake size</StepLabel></legend>
        <div className="grid sm:grid-cols-3 gap-3">
          {CAKE_SIZES.map((s) => (
            <label
              key={s.key}
              className={`cursor-pointer border px-4 py-3 transition-colors ${
                size === s.key ? 'border-brown-600 bg-brown-50' : 'border-brown-200 hover:border-brown-400'
              }`}
            >
              <input type="radio" name="cake-size" value={s.key} checked={size === s.key} onChange={() => setSize(s.key)} className="sr-only" />
              <span className="block font-semibold text-brown-800">{s.label}</span>
              <span className="block text-xs text-brown-400 mt-0.5">{s.servings}</span>
              {s.startingPrice != null && (
                <span className="block text-sm font-semibold text-brown-600 mt-1.5">From {formatPrice(s.startingPrice)}</span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      {/* 2. Flavour */}
      <fieldset className="mb-6">
        <legend><StepLabel number={2}>Choose your cake flavour *</StepLabel></legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CAKE_FLAVOURS.map((f) => (
            <label
              key={f}
              className={`cursor-pointer border px-3 py-2.5 text-sm text-center transition-colors ${
                flavour === f ? 'border-brown-600 bg-brown-50 text-brown-800 font-semibold' : 'border-brown-200 text-brown-600 hover:border-brown-400'
              }`}
            >
              <input type="radio" name="cake-flavour" value={f} checked={flavour === f} onChange={() => setFlavour(f)} className="sr-only" />
              {f}
            </label>
          ))}
        </div>
        {flavour === OTHER_FLAVOUR && (
          <input
            value={otherFlavour}
            onChange={(e) => setOtherFlavour(e.target.value)}
            placeholder="Which flavour would you like?"
            aria-label="Other flavour"
            className={`${inputClass} mt-3`}
          />
        )}
        <FieldError message={err('flavour')} />
      </fieldset>

      {/* 3. Date */}
      <div className="mb-6">
        <label htmlFor="cake-date"><StepLabel number={3}>Preferred pickup / delivery date *</StepLabel></label>
        <input id="cake-date" type="date" min={minDate()} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        <FieldError message={err('date')} />
      </div>

      {/* 4. Personalisation + reference photos */}
      <div className="mb-6">
        <label htmlFor="cake-details"><StepLabel number={4}>Personalisation and design details *</StepLabel></label>
        <textarea
          id="cake-details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          placeholder="Cake colour, writing, theme, inspiration and any special requests"
          className={inputClass}
        />
        <FieldError message={err('details')} />

        <p className="text-sm font-semibold text-brown-700 mt-4 mb-1">Reference photos (optional)</p>
        <p className="text-xs text-brown-400 mb-3">Upload up to {MAX_PHOTOS} photos of designs you love.</p>
        <div className="flex flex-wrap gap-3">
          {photos.map((p) => (
            <div key={p.id} className="relative w-24 h-24 border border-brown-100 bg-cream-100">
              <img src={p.preview} alt="Cake reference" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(p.id)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brown-700 text-white flex items-center justify-center hover:bg-brown-800"
                aria-label="Remove photo"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 border-2 border-dashed border-brown-200 text-brown-400 hover:border-brown-400 hover:text-brown-600 flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <ImagePlus size={22} strokeWidth={1.5} />
              <span className="text-xs font-medium">Add photo</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }}
        />
      </div>

      {/* 5. Pickup or delivery */}
      <fieldset className="mb-6">
        <legend><StepLabel number={5}>Pickup or delivery *</StepLabel></legend>
        <div className="flex gap-3">
          {['pickup', 'delivery'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFulfilment(opt)}
              aria-pressed={fulfilment === opt}
              className={`flex-1 px-3 py-2.5 text-sm font-medium uppercase tracking-wide border transition-colors ${
                fulfilment === opt
                  ? 'bg-brown-600 text-white border-brown-600'
                  : 'border-brown-200 text-brown-600 hover:bg-brown-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {fulfilment === 'delivery' && (
          <div className="mt-3">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Delivery address, including suburb"
              aria-label="Delivery address"
              className={inputClass}
            />
            <p className="text-xs text-brown-400 mt-1.5">
              See our <a href="/delivery" className="underline hover:text-brown-600">delivery zones</a>. Delivery fees are confirmed with your quote.
            </p>
            <FieldError message={err('address')} />
          </div>
        )}
      </fieldset>

      {/* 6. Allergies */}
      <div className="mb-6">
        <label htmlFor="cake-allergies"><StepLabel number={6}>Allergies or dietary requirements</StepLabel></label>
        <textarea
          id="cake-allergies"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          rows={2}
          placeholder="e.g. nut allergy, egg-free — leave blank if none"
          className={inputClass}
        />
      </div>

      {/* 7. Contact details */}
      <fieldset className="mb-8">
        <legend><StepLabel number={7}>Your details *</StepLabel></legend>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="cake-name" className="block text-xs font-semibold uppercase tracking-wide text-brown-500 mb-1.5">Name</label>
            <input id="cake-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" className={inputClass} />
            <FieldError message={err('name')} />
          </div>
          <div>
            <label htmlFor="cake-email" className="block text-xs font-semibold uppercase tracking-wide text-brown-500 mb-1.5">Email</label>
            <input id="cake-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className={inputClass} />
            <FieldError message={err('email')} />
          </div>
          <div>
            <label htmlFor="cake-phone" className="block text-xs font-semibold uppercase tracking-wide text-brown-500 mb-1.5">Phone</label>
            <input id="cake-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="04xx xxx xxx" autoComplete="tel" className={inputClass} />
            <FieldError message={err('phone')} />
          </div>
        </div>
      </fieldset>

      {/* Enquiry summary + submit */}
      <div className="bg-cream-200 border border-cream-300 p-6">
        <p className="font-serif text-lg font-bold text-brown-800 mb-2">Your cake enquiry</p>
        <p className="text-sm text-brown-700">
          {[selectedSize.label, flavourText].filter(Boolean).join(' · ')}
          {date && <> · {new Date(`${date}T00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</>}
          {' · '}{fulfilment === 'pickup' ? 'Pickup' : 'Delivery'}
        </p>
        {photos.length > 0 && (
          <p className="text-sm text-brown-500 mt-1">{photos.length} reference photo{photos.length > 1 ? 's' : ''} attached</p>
        )}
        <p className="text-xs text-brown-500 mt-2 mb-5">Final pricing and availability confirmed by Crumbs &amp; Cream.</p>

        <label className="flex items-start gap-3 text-sm text-brown-600 mb-1 cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-brown-600 flex-shrink-0"
          />
          <span>
            I understand this is an enquiry, not an order confirmation. Crumbs &amp; Cream will contact me to
            confirm availability, pricing and payment.
          </span>
        </label>
        <FieldError message={err('acknowledged')} />

        <button
          type="submit"
          disabled={status === 'sending'}
          className="btn-primary w-full text-center flex items-center justify-center gap-2 mt-5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'sending' && <Loader2 size={16} className="animate-spin" />}
          {status === 'sending' ? 'Sending…' : 'Submit Cake Enquiry'}
        </button>

        {status === 'error' && (
          <div className="mt-3 text-sm text-red-600 flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              {errorMessage || "Couldn't send automatically."}{' '}
              <a href={mailtoLink('Custom Cake Enquiry — Crumbs & Cream', summary)} className="underline font-medium">
                Email us directly instead
              </a>
              {photos.length > 0 && ' (please attach your reference photos to the email)'}.
            </span>
          </div>
        )}
      </div>
    </form>
  );
}
