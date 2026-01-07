# Markerlarni Stabilizatsiya Qilish Rejasi (PointAnnotation ga o'tish)

Ushbu reja xaritadagi markerlarning "o'ynashi", yo'qolib qolishi va flicker (lip-lip) qilish muammolarini butunlay hal qilishga qaratilgan.

## Muammoning Sababi
Hozirgi `Mapbox.MarkerView` komponenti native emas. U React Native View'ni xarita ustiga chizadi ("overlay"). Xarita tez harakatlanganda, bu View'lar xaritaga yetib olishga harakat qiladi va lag paydo bo'ladi. Ba'zan esa ko'rinmay qoladi.

## Yechim: `Mapbox.PointAnnotation`
Biz barcha markerlarni Mapbox'ning o'zini native **`PointAnnotation`** komponentiga o'tkazamiz.

### ✅ Afzalliklari
1. **Stabil:** Marker xarita bilan birga harakatlanadi (lag yo'q).
2. **Io'qolmaydi:** Native darajada chizilgani uchun har doim ko'rinadi.
3. **Optimallashgan:** Xarita dvigateli (engine) bu markerlarni o'zi boshqaradi.

---

## 🛠️ Amalga Oshirish Bosqichlari

### 1-Bosqich: StationMarker.js ni o'zgartirish
`StationMarker` komponenti ichidagi `Mapbox.MarkerView` ni `Mapbox.PointAnnotation` ga almashtiramiz.

**Kod o'zgarishi:**
```javascript
// ESKI (MarkerView)
<Mapbox.MarkerView coordinate={coordinate}>
  <TouchableOpacity>...</TouchableOpacity>
</Mapbox.MarkerView>

// YANGI (PointAnnotation)
<Mapbox.PointAnnotation
  id={`marker-${item.stationId}`} // Har bir marker ID si unikal bo'lishi SHART
  coordinate={coordinate}
  onSelected={() => onPress(item)} // Bosganda ishlashi uchun
>
  <View>...</View> {/* Ichidagi dizayn o'zgarmaydi (SVG qolaveradi) */}
</Mapbox.PointAnnotation>
```

### 2-Bosqich: App.js ni tozalash
Xaritada markerlarni render qilish qismini soddalashtiramiz. `PointAnnotation` ishlatilganda, `key` va `id` juda muhim.

### 3-Bosqich: Test Qilish
- **Zoom In/Out:** Markerlar joyida qotib turishi kerak.
- **Pan (Surish):** Markerlar xarita bilan birga silliq yurishi kerak.
- **Kun/Tun almashish:** Lip-lip (flicker) bo'lmasligi kerak.
