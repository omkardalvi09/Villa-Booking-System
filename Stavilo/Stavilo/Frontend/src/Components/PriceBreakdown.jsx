function PriceBreakdown({ pricePreview }) {
  if (!pricePreview) return null;

  const isEntireVilla = pricePreview.pricingModel === "entire_villa";

  const extraGuests =
    Math.max(
      pricePreview.persons - (pricePreview.baseGuests || 0),
      0
    );

  return (
    <div className="bg-[#0f0f0f] p-4 rounded-lg space-y-3 text-white">
      <h3 className="text-lg font-semibold">Price Breakdown</h3>

      {/* ================= ENTIRE VILLA ================= */}
      {isEntireVilla ? (
        <>
          <div className="flex justify-between text-sm">
            <span>Base Price</span>
            <span>
              ₹ {pricePreview.basePrice * pricePreview.nights}
            </span>
          </div>

          {extraGuests > 0 && (
            <div className="flex justify-between text-sm">
              <span>Extra Guests ({extraGuests})</span>
              <span>
                ₹{" "}
                {extraGuests *
                  pricePreview.extraGuestCharge *
                  pricePreview.nights}
              </span>
            </div>
          )}
        </>
      ) : (
        /* ================= PER PERSON ================= */
        <>
          <div className="flex justify-between text-sm">
            <span>Adults ({pricePreview.adults})</span>
            <span>₹ {pricePreview.adultsCost}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Children ({pricePreview.children})</span>
            <span>₹ {pricePreview.childrenCost}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Infants ({pricePreview.infants})</span>
            <span>Free</span>
          </div>
        </>
      )}

      {/* Nights */}
      <div className="flex justify-between text-sm">
        <span>Total Nights</span>
        <span>{pricePreview.nights}</span>
      </div>

      {/* Discount */}
      {pricePreview.discountPercent > 0 && (
        <div className="flex justify-between text-green-400 text-sm">
          <span>Discount ({pricePreview.discountPercent}%)</span>
          <span>- ₹ {pricePreview.discountAmount}</span>
        </div>
      )}

      {/* Guests */}
      <div className="flex justify-between text-sm text-white/70">
        <span>Total Guests</span>
        <span>{pricePreview.persons}</span>
      </div>

      {/* Total */}
      <div className="border-t pt-3 flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>₹ {pricePreview.totalPrice}</span>
      </div>
    </div>
  );
}

export default PriceBreakdown;