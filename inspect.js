// inspect.js - Construction inspection checklist

const INSPECT_PHASES = [
  {id:'d1',num:'Đ1',title:'Ký HĐ + Chuẩn bị mặt bằng',pay:'50tr',
   note:{type:'info',text:'Đợt 1: 50 triệu khi ký hợp đồng. ABK cung cấp bản vẽ KT + KC + DN (Đ6.16).'},
   groups:[
    {name:'Hồ sơ & pháp lý',items:[
      {text:'Nhận đủ bộ bản vẽ: KT, KC, DN',detail:'ABK tặng thiết kế (PLHD mục 17). Kiểm tra đã ký duyệt.',tags:[['h','Đ6.16']]},
      {text:'GPXD đã cấp, đúng thông tin công trình',detail:'ABK tặng GPXD (PLHD mục 18). Kiểm tra số tầng, diện tích.',tags:[['t','TC28 #28']]},
      {text:'Nhật ký công trình — ABK phải lập và duy trì',detail:'CĐT có quyền xem bất kỳ lúc nào.',tags:[['h','Đ8.2-8.3']]},
      {text:'Chụp ảnh hiện trạng + nhà kế bên TRƯỚC thi công',detail:'Bằng chứng phòng tranh chấp nứt nhà hàng xóm.',tags:[['i','Quan trọng']]}
    ]},
    {name:'Thảo luận với ABK trước thi công',items:[
      {text:'Xác nhận chiều dài cọc — KC_P4 ghi "để trống"',detail:'Ép cọc thử trước. Yêu cầu ABK xác nhận bằng văn bản.',tags:[['c','CRITICAL'],['d','KC']]},
      {text:'Thống nhất điện 3 pha — KHÔNG trong gói thầu',detail:'PLHD: "chưa bao gồm hệ thống điện 3 pha, cấp nguồn 3 pha thang máy".',tags:[['c','CRITICAL'],['h','PLHD']]},
      {text:'Bản vẽ điện nhẹ (LAN, camera, chuông cửa)',detail:'PLHD loại trừ. Nếu cần → chừa ống ngầm từ giai đoạn thô.',tags:[['i','Quan trọng']]},
      {text:'Vị trí cục nóng điều hòa 4 máy',detail:'PLHD có 50md ống đồng. Chốt vị trí để chừa lỗ + giá treo.',tags:[['i','Quan trọng']]},
      {text:'Nền nhà cao hơn đường bao nhiêu',detail:'PLHD: cao >40cm → phát sinh. Xác nhận trước.',tags:[['h','PLHD mục 3']]}
    ]}
  ]},
  {id:'d2',num:'Đ2',title:'Ép cọc + Đào móng',pay:'194tr',
   note:{type:'warn',text:'Đợt 2: 194tr khi xong ép cọc + đổ móng.'},
   groups:[
    {name:'Ép cọc',items:[
      {text:'Chủng loại cọc: đúng 250×250mm BTCT',detail:'Đo kích thước, kiểm tra tem nhà sản xuất, không nứt vỡ.',tags:[['d','KC']]},
      {text:'Ghi nhận lực ép cuối (tonnage) từng cọc',detail:'Biên bản ép cọc: vị trí, chiều dài, lực ép cuối. CĐT ký xác nhận.',tags:[['c','CRITICAL']]},
      {text:'Vị trí cọc đúng tim trục KC',detail:'Sai lệch ≤ 50mm. Đo bằng thước từ mốc.',tags:[['d','KC']]},
      {text:'Đầu cọc nhô 15-20cm để ngàm vào đài',detail:'TC28 #1: cắt đầu cọc đúng cao độ, cốt thép ngàm vào đài.',tags:[['t','TC28 #1']]}
    ]},
    {name:'Đào móng & đài cọc',items:[
      {text:'Kích thước đài cọc đúng bản vẽ KC',detail:'Đo chiều dài, rộng, sâu đài.',tags:[['d','KC']]},
      {text:'Lót đá 4×6 đáy móng + BT lót 100mm',detail:'Đá xám xanh (PLHD), BT lót bằng phẳng.'},
      {text:'Thép đài + đà kiềng: đúng chủng loại, số lượng',detail:'Thép Việt Nhật (PLHD). KC ghi rõ kích thước + bố trí.',tags:[['c','CRITICAL'],['d','KC']]},
      {text:'Cục kê BT — lớp bảo vệ ≥ 30mm cho móng',detail:'TC28 #11: cục kê BT, KHÔNG dùng gạch ống/đá vỡ.',tags:[['t','TC28 #11']]},
      {text:'Ống thoát nước đặt TRƯỚC khi đổ BT',detail:'DN: "Đặt lỗ chờ khi đổ BT". D114 phân + D90 chậu rửa.',tags:[['c','CRITICAL'],['d','DN']]}
    ]},
    {name:'Đan sắt đài cọc',items:[
      {text:'Thép đài: đúng đường kính + số lượng theo KC',detail:'Đếm thép lớp dưới + lớp trên. Đo bằng thước kẹp.',tags:[['c','CRITICAL'],['d','KC']]},
      {text:'Khoảng cách thép đài đều, đúng bước (@150/@200)',detail:'Dùng thước đo. Sai lệch ±10mm.',tags:[['d','KC']]},
      {text:'Thép cọc ngàm vào đài đủ 15-20cm',detail:'TC28 #1: cốt thép đầu cọc xòe ra, ngàm chặt.',tags:[['t','TC28 #1']]},
      {text:'Mối buộc thép chắc — buộc kẽm, không hàn',detail:'Phải chặt, không xê dịch khi dẫm lên.',tags:[['i','Quan trọng']]},
      {text:'Nối chồng thép ≥ 30d, mối nối so le',detail:'VD: D12 → nối ≥ 360mm. Không nối cùng mặt cắt.',tags:[['c','CRITICAL']]},
      {text:'Thép sạch — không rỉ nặng, không bùn đất',detail:'Rỉ nhẹ OK. Rỉ nặng/bùn → giảm bám dính BT.'}
    ]},
    {name:'Đan sắt đà kiềng (giằng móng)',items:[
      {text:'Thép chủ đà kiềng: đúng số lượng + đường kính',detail:'KC_P5: thép trên + dưới (VD: 2D16 trên + 2D16 dưới).',tags:[['c','CRITICAL'],['d','KC']]},
      {text:'Thép đai đà kiềng: đúng bước, móc 135°',detail:'D6/D8 @150-200. Đai vuông góc thép chủ. Đo từng đai.',tags:[['c','CRITICAL']]},
      {text:'Đai dày hơn 2 đầu (vùng gối, 1/4 nhịp)',detail:'Gần cột/đài: @100. Giữa nhịp: @150-200.',tags:[['d','KC']]},
      {text:'Thép đà kiềng neo vào đài đủ chiều dài',detail:'Uốn móc L/U theo KC. Không cắt sát mép đài.',tags:[['i','Quan trọng']]}
    ]},
    {name:'Đan sắt cột tầng trệt',items:[
      {text:'Thép chủ cột: đúng số lượng + đường kính',detail:'VD 4D18 hoặc 6D16. Đếm + đo từng cây. Thép Việt Nhật.',tags:[['c','CRITICAL'],['d','KC']]},
      {text:'Thép đai cột: đúng bước, móc 135°',detail:'TC28 #5: đai chân/đầu cột @100, giữa @150-200.',tags:[['c','CRITICAL'],['t','TC28 #5']]},
      {text:'Nối chồng cột: giữa cột (1/3 giữa), KHÔNG ở chân',detail:'Nối chân = vùng lực lớn nhất → nguy hiểm. ≥ 30d, so le.',tags:[['c','CRITICAL']]},
      {text:'Râu thép cột chờ xây tường',detail:'TC28 #5: D6-D8 nhô 2 bên, cách 400-500mm.',tags:[['t','TC28 #5']]},
      {text:'Cốp pha cột kín, thẳng đứng',detail:'Kiểm tra dây dọi/laser. Sai lệch ≤ 5mm.'}
    ]},
    {name:'Hầm tự hoại (bể phốt)',items:[
      {text:'Kích thước bể phốt đúng DN',detail:'Thường 2.5×2.5×1.68m, 3 ngăn.',tags:[['d','DN P41']]},
      {text:'Xây bằng gạch đỉnh — 2 hàng sole kín mạch',detail:'TC28 #2 + #3: gạch đỉnh Tuynel.',tags:[['t','TC28 #2,3']]},
      {text:'Thỏ chống hôi (siphon) mọi phễu thu sàn',detail:'TC28 #14 + HĐ Đ3.',tags:[['t','TC28 #14'],['h','Đ3']]}
    ]},
    {name:'Hố PIT thang máy',items:[
      {text:'Kích thước hố PIT đúng yêu cầu thang 350KG',detail:'PLHD mục 16: dày 200mm + vách BTCT 200mm, D10@200.',tags:[['c','CRITICAL']]},
      {text:'Chống thấm hố PIT',detail:'Ngập nước = hỏng motor. Kiểm tra chống thấm + hố ga bơm.',tags:[['c','CRITICAL']]}
    ]}
  ]},
  {id:'d3',num:'Đ3',title:'Đổ sàn Trệt (cote -0.050)',pay:'194tr',
   note:{type:'info',text:'Đợt 3: 194tr. Kiểm tra TRƯỚC khi đổ BT — sau đổ không sửa được!'},
   groups:[
    {name:'Cốp pha (ván khuôn)',items:[
      {text:'Xà gồ, giàn giáo H, chống tầng đúng chuẩn',detail:'TC28 #23: xà gồ thép, giàn giáo H. Không tre/gỗ tạp.',tags:[['t','TC28 #23']]},
      {text:'Cốp pha kín, phẳng, đúng cao độ cote',detail:'Đo bằng laser. Trệt: -0.050 (KC), WC: -0.350.',tags:[['d','KC P14']]}
    ]},
    {name:'Cốt thép sàn + dầm',items:[
      {text:'Thép sàn D10 @200 — 1 lớp (sàn 100mm)',detail:'TC28 #10: D10 thay vì D8. Đo khoảng cách bằng thước.',tags:[['t','TC28 #10'],['h','PLHD #14']]},
      {text:'Thép dầm chủ (dưới): đúng SL + đường kính',detail:'VD: GBY.3 (300×700) → 4D20 hoặc 6D18. Đếm + đo.',tags:[['c','CRITICAL'],['d','KC P14']]},
      {text:'Thép dầm giá (trên): đủ số lượng',detail:'Chịu moment âm tại gối. Không bỏ bớt.',tags:[['d','KC']]},
      {text:'Thép đai dầm: đúng bước + móc 135°',detail:'Đầu dầm @100 (1/4 nhịp), giữa @150-200.',tags:[['c','CRITICAL']]},
      {text:'Nối chồng dầm: giữa nhịp (thép dưới), gần gối (trên)',detail:'KHÔNG nối thép dưới gần gối. ≥ 30d, so le.',tags:[['c','CRITICAL']]},
      {text:'Sắt mũ 2 lớp tại giao cột-dầm-sàn',detail:'TC28 #12: vươn ra ≥ 1/4 nhịp từ mép cột.',tags:[['t','TC28 #12']]},
      {text:'Thép sàn 2 phương vuông góc — đúng lớp',detail:'Phương ngắn (chịu lực) dưới, phương dài trên. @200 đều.',tags:[['d','KC']]},
      {text:'Cục kê BT — 20mm sàn, 25mm dầm',detail:'TC28 #11: cục kê BT, ~4 cục/m² sàn.',tags:[['t','TC28 #11']]},
      {text:'Thép neo dầm vào cột: đủ chiều dài, uốn móc',detail:'Thép phải ăn qua cột hoặc uốn vuông. Không cắt sát mép.',tags:[['c','CRITICAL']]},
      {text:'Lỗ chờ ống thoát nước trong sàn WC',detail:'DN P26: "PHẢI ĐẶT LỖ CHỜ". Vị trí bồn cầu, lavabo, phễu.',tags:[['c','CRITICAL'],['d','DN P26']]},
      {text:'Ống luồn dây điện âm sàn đã đặt',detail:'Ống ruột gà D25-D20. Không bẹp, đầu bịt.'}
    ]},
    {name:'Đổ bê tông',items:[
      {text:'BT Mác 250 — thương phẩm hoặc trộn tại chỗ',detail:'PLHD: M250. Xi măng Holcim/INSEE.',tags:[['h','PLHD']]},
      {text:'Lấy mẫu BT (nếu cần) — 3 mẫu/lần đổ',detail:'CĐT có quyền yêu cầu thử nén 28 ngày.',tags:[['i','Quan trọng']]},
      {text:'Đổ cột: từng đoạn <1m, đầm kỹ',detail:'TC28 #5: kiểm tra đai chân/đầu cột.',tags:[['t','TC28 #5']]},
      {text:'Đầm BT đủ — không rỗ tổ ong',detail:'Đầm dùi đưa vào đủ vị trí, đặc biệt góc dầm-cột.'}
    ]},
    {name:'Bảo dưỡng sau đổ',items:[
      {text:'Bao bạt/bao bố 2-3 ngày + tưới ẩm',detail:'HĐ Đ3 + TC28 #18.',tags:[['t','TC28 #18'],['h','Đ3']]},
      {text:'KHÔNG chất tải lên sàn mới đổ 7 ngày',detail:'Tránh xếp gạch, vật liệu nặng.'}
    ]}
  ]},
  {id:'d4-8',num:'Đ4-8',title:'Sàn L1 → Mái (mỗi tầng)',pay:'194+135×4',
   note:{type:'info',text:'Đ4=L1 (194tr), Đ5=L2 (135tr), Đ6=L3 (135tr), Đ7=ST (135tr), Đ8=Mái (135tr). Kiểm tra giống Đ3 + thêm:'},
   groups:[
    {name:'Lặp lại Đ3',items:[
      {text:'Toàn bộ kiểm tra cốp pha + thép + BT giống Đ3',detail:'Mỗi tầng kiểm tra lại. Đặc biệt cote từng tầng.'}
    ]},
    {name:'Kiểm tra thêm mỗi tầng',items:[
      {text:'Râu cột liên kết tường đã chờ sẵn',detail:'TC28 #5: chờ râu ở vị trí tường sẽ xây.',tags:[['t','TC28 #5']]},
      {text:'Ống thoát WC đi dưới sàn — đúng DN + độ dốc',detail:'D114 phân (1.5%), D90 chậu rửa (1.65%), D60 lavabo (2.0%).',tags:[['c','CRITICAL'],['d','DN P26']]},
      {text:'Ống PPR (Bình Minh) cho nước nóng',detail:'PLHD: PPR D25. KHÔNG dùng PVC cho nước nóng.',tags:[['h','PLHD']]},
      {text:'Ống đồng điều hòa chừa trong tường',detail:'PLHD 50md/4 máy. Lỗ xuyên tường vị trí cục nóng.'},
      {text:'CHỤP ẢNH đường điện + nước TRƯỚC tô/ốp',detail:'HĐ Đ5.7: bắt buộc chụp ảnh trước bịt kín.',tags:[['c','CRITICAL'],['h','Đ5.7']]}
    ]},
    {name:'Riêng Sân thượng + Mái',items:[
      {text:'Tường bao sân thượng có đà giằng BT',detail:'TC28 #8: chống nứt + gió bão.',tags:[['t','TC28 #8']]},
      {text:'Gờ 10cm chân tường hồi sân thượng',detail:'TC28 #9: đổ gờ BT trước xây tường.',tags:[['t','TC28 #9']]},
      {text:'Sàn mái BTCT 100mm + tường 0.4m',detail:'PLHD mục 10. KC_P33.',tags:[['d','KC P33']]}
    ]}
  ]},
  {id:'d9',num:'Đ9',title:'Xây tường + Tô tường',pay:'105tr',
   groups:[
    {name:'Xây tường',items:[
      {text:'Gạch đỉnh Tuynel: chân tường, đổ cửa, bể phốt',detail:'TC28 #2: 4×8×18cm Tuynel. Chân tường 3 hàng đầu.',tags:[['t','TC28 #2']]},
      {text:'Gạch ống 8×8×18cm Tuynel cho tường chính',detail:'PLHD. Sole kín mạch, mạch vữa 10-15mm.',tags:[['h','PLHD']]},
      {text:'Tường >5m có bổ trụ BT âm',detail:'TC28 #6: nhà dài 12.6m → tường dọc chắc chắn cần.',tags:[['t','TC28 #6']]},
      {text:'Tường thẳng đứng — dây dọi/laser',detail:'Sai lệch ≤ 5mm/tầng.'}
    ]},
    {name:'Tô tường',items:[
      {text:'Ghém laser TRƯỚC khi tô',detail:'TC28 #16: đánh mốc laser, ke góc 90°.',tags:[['t','TC28 #16']]},
      {text:'Lưới mắt cáo: tường-cột, tường-dầm, rãnh điện',detail:'TC28 #7 + HĐ Đ3: lưới chống nứt.',tags:[['t','TC28 #7'],['h','Đ3']]},
      {text:'Vữa mác 75 — cát xây tô (PLHD)',detail:'Xi măng Hà Tiên CP30.',tags:[['h','PLHD']]},
      {text:'Bảo dưỡng: tưới nước 12-24h sau tô',detail:'TC28 #26: nhất là trời nóng.',tags:[['t','TC28 #26']]}
    ]}
  ]},
  {id:'d10',num:'Đ10-11',title:'Điện nước + Chống thấm',pay:'105×2',
   groups:[
    {name:'Điện',items:[
      {text:'Dây Cadivi đúng tiết diện',detail:'Nguồn 8.0, trục chính 6.0, bếp 4.0, ổ 2.5, đèn 1.5mm².',tags:[['h','PLHD']]},
      {text:'Ống ruột gà D25-D20 không bẹp',detail:'HĐ Đ3: ống ngầm thử nước trước boxing.',tags:[['h','Đ3']]},
      {text:'Công tắc Panasonic Wide đủ số lượng',detail:'~108 điểm tổng. Đếm từng tầng.',tags:[['h','PLHD']]},
      {text:'Tủ điện Sino + MCB Panasonic đúng Ampe',detail:'Mỗi tầng 1 tủ + 9-11 MCB.',tags:[['h','PLHD']]}
    ]},
    {name:'Nước',items:[
      {text:'TEST ÁP LỰC cấp nước TRƯỚC hộp gen',detail:'TC28 #21: bơm áp 15 phút, đồng hồ không tụt.',tags:[['c','CRITICAL'],['t','TC28 #21'],['h','Đ3']]},
      {text:'Thoát riêng: mưa / sinh hoạt / bếp → hố ga riêng',detail:'TC28 #22: 3 hệ thống riêng.',tags:[['t','TC28 #22']]}
    ]},
    {name:'Chống thấm',items:[
      {text:'WC + ban công: CT-11A, 2 lớp + lưới thủy tinh',detail:'HĐ Đ3 + TC28 #24. Ngâm 24h test trước lát.',tags:[['c','CRITICAL'],['t','TC28 #24'],['h','Đ3']]},
      {text:'Tường ngoài: AK800, 2 lớp + AK Primer',detail:'PLHD: ~187m² tạm tính.',tags:[['h','PLHD']]},
      {text:'Sân thượng + mái: CT-11A & Sika',detail:'Ngâm 24-48h test.',tags:[['h','PLHD']]}
    ]}
  ]},
  {id:'d12',num:'Đ12-13',title:'Hoàn thiện: Sơn, gạch, cửa',pay:'135×2',
   groups:[
    {name:'Cán nền + Lát gạch',items:[
      {text:'Cán nền xi măng mác 75 — ghém laser',detail:'TC28 #19: khoảng cách 2.0-2.2m, tưới nước sau cán.',tags:[['t','TC28 #19']]},
      {text:'Lát gạch SÀN CHẾT — nền khô cứng',detail:'TC28 #20: xi măng loãng rưới lên nền.',tags:[['t','TC28 #20']]},
      {text:'Ke nêm ron gạch đều — khe 1.5mm',detail:'TC28 #15 + HĐ Đ5.7.',tags:[['t','TC28 #15'],['h','Đ5.7']]},
      {text:'Gạch đúng loại PLHD',detail:'Nền 600×600/800×800, WC nhám 300×600.',tags:[['h','PLHD']]},
      {text:'Bao che sàn sau ốp lát',detail:'TC28 #17: tránh trầy xước.',tags:[['t','TC28 #17']]}
    ]},
    {name:'Sơn',items:[
      {text:'Bột trét Jotun nội thất — 2 lớp',detail:'Bề mặt phẳng sau trét.',tags:[['h','PLHD']]},
      {text:'Sơn Jotun lau chùi — 2 lớp màu',detail:'1,090m² tổng. CĐT chọn màu.'},
      {text:'Sơn ngoại thất: trét 2 + lót 1 + màu 2',detail:'Mặt tiền 204m².'}
    ]},
    {name:'Cửa',items:[
      {text:'Cửa nhôm XingFa VN: hệ 55, kính 8ly, 3 bản lề',detail:'Kiểm tra tem XingFa VN chính hãng.',tags:[['i','Quan trọng'],['h','PLHD']]},
      {text:'Cửa chính Eurotech trượt quay',detail:'PLHD: 3.00×2.86m, dày 2.0ly.'},
      {text:'Cửa phòng ngủ Composite + khóa Vickini',detail:'0.9×2.2m. 5 bộ ổ khóa.'}
    ]},
    {name:'Cầu thang + Lan can',items:[
      {text:'Đá cầu thang đen Campuchia + trắng nhân tạo',detail:'46m² mặt + 5.38m² chiếu nghỉ.',tags:[['h','PLHD']]},
      {text:'Lan can kính 10ly + trụ inox + tay vịn gỗ cẩm xe',detail:'Ban công + sân thượng.'}
    ]},
    {name:'Trần thạch cao',items:[
      {text:'Khung Toàn Châu, tấm Gyproc Vĩnh Tường',detail:'267.6m² tổng. 4 nắp thăm WC.',tags:[['h','PLHD']]},
      {text:'Khoảng cách xương: chính 0.8-1m, phụ 0.4-0.6m',detail:'TC28 #25: đo bằng thước.',tags:[['t','TC28 #25']]}
    ]}
  ]},
  {id:'d14',num:'Đ14',title:'TBVS + Bàn giao',pay:'50tr',
   groups:[
    {name:'Thiết bị vệ sinh',items:[
      {text:'Bồn cầu INAX/Viglecera 1 khối — 5 bộ',detail:'3,200K/bộ. Kiểm tra không rò rỉ.'},
      {text:'Lavabo + vòi nóng lạnh INAX',detail:'Mỗi WC: lavabo 2,000K + vòi 950K.'},
      {text:'Sen đứng nóng lạnh + vòi xịt',detail:'Sen 1,350K + xịt 250K. Test nước nóng lạnh.'},
      {text:'Phụ kiện INOX 6 món + gương soi',detail:'Mỗi WC: 6 món 1,200K + gương 290K.'},
      {text:'Quạt hút trần Nanoco có ống dẫn',detail:'NCV1520-C. Chạy + thông ống ra ngoài.'}
    ]},
    {name:'Thiết bị khác',items:[
      {text:'Bơm Panasonic GP-200JXK + bồn Đại Thành 1000L',detail:'Bơm 1,850K + bồn 4,100K + phao + chân.'},
      {text:'Tủ bếp trên + dưới 3.5m + đá Campuchia',detail:'PLHD: nhựa chống ẩm, Acrylic bóng gương.'},
      {text:'Chuông cổng Panasonic',detail:'1,150K.'},
      {text:'Máy nước nóng NLMT 160L Đại Thành (tặng)',detail:'PLHD mục 19. Kiểm tra kết nối nước nóng.'}
    ]},
    {name:'Nghiệm thu bàn giao',items:[
      {text:'Vệ sinh công nghiệp toàn bộ nhà',detail:'3,500K gói VSCN.'},
      {text:'Kiểm tra toàn bộ ĐIỆN: tắt/bật từng công tắc',detail:'Bật từng cái, cắm thử từng ổ. Đèn đủ bóng.'},
      {text:'Kiểm tra toàn bộ NƯỚC: xả 5-10 phút mỗi điểm',detail:'Không rò rỉ, thoát không ứ.'},
      {text:'Kiểm tra CỬA: đóng mở êm, khóa, gioăng kín',detail:'Mở đóng từng cánh. Khóa Vickini.'},
      {text:'Kiểm tra GẠCH: gõ thử — không bộp, ron đều',detail:'Gõ nhẹ. Bộp = không bám → yêu cầu thay.'},
      {text:'Kiểm tra SƠN: soi đèn pin 45° vào tường',detail:'Thấy rõ vệt lồi lõm, trét chưa mịn.'},
      {text:'Đấu nối thoát nước ra cống TP',detail:'PLHD loại trừ — xác nhận ai chịu chi phí.',tags:[['i','Quan trọng']]}
    ]}
  ]},
  {id:'d15',num:'Đ15-16',title:'Bảo hành 6+12 tháng',pay:'25×2 giữ lại',
   note:{type:'warn',text:'Giữ 50tr: 25tr trả sau 6 tháng, 25tr trả sau 12 tháng. ABK có mặt trong 3 ngày nếu sự cố.'},
   groups:[
    {name:'Theo dõi 12 tháng đầu',items:[
      {text:'Kiểm tra nứt tường — chụp ảnh, đo chiều dài',detail:'BH 12 tháng. Nứt chân chim = bình thường. Nứt dọc cột-tường = thiếu lưới.',tags:[['h','BH 12 tháng']]},
      {text:'Kiểm tra thấm sau mùa mưa đầu',detail:'BH 60 tháng. Nhìn trần dưới WC/sân thượng.',tags:[['h','BH 60 tháng']]},
      {text:'Kiểm tra thoát nước: không đọng',detail:'Xả nước. Đọng = sai dốc hoặc phễu nghẹt.'},
      {text:'Kiểm tra sơn: bong tróc, phồng, ố vàng',detail:'BH 12 tháng. Ố = thấm ẩm từ tường.',tags:[['h','BH 12 tháng']]}
    ]}
  ]}
];

const INS_TAG_CLS = {c:'ins-tg-c',i:'ins-tg-i',h:'ins-tg-h',d:'ins-tg-d',t:'ins-tg-t'};
const INS_STORAGE_KEY = 'xaynha_inspect_v1';

let insState = {checks:{},notes:{}};
let insFilter = 'all';
let insPhase = 'all';
let insSearch = '';

function insLoadState(){
  try{const s=localStorage.getItem(INS_STORAGE_KEY);if(s)insState=JSON.parse(s)}catch(e){}
}
function insSaveState(){
  try{localStorage.setItem(INS_STORAGE_KEY,JSON.stringify(insState))}catch(e){}
}

function insItemId(pid,gi,ii){return `${pid}_${gi}_${ii}`}

function insAllItems(){
  const items=[];
  INSPECT_PHASES.forEach(p=>{
    p.groups.forEach((g,gi)=>{
      g.items.forEach((it,ii)=>{
        items.push({...it,id:insItemId(p.id,gi,ii),phaseId:p.id});
      });
    });
  });
  return items;
}

function insIsCritical(item){
  return item.tags && item.tags.some(t=>t[0]==='c'||t[0]==='i');
}

function loadInspect(){
  insLoadState();
  const page=document.getElementById('page-inspect');
  const all=insAllItems();
  const done=all.filter(i=>insState.checks[i.id]).length;
  const pct=all.length?Math.round(done/all.length*100):0;

  let html=`
    <div class="ins-toolbar">
      <div class="ins-progress">
        <div class="ins-progress-track"><div class="ins-progress-fill" style="width:${pct}%"></div></div>
        <span class="ins-progress-pct">${pct}%</span>
        <span class="ins-progress-count">${done}/${all.length}</span>
      </div>
      <input class="ins-search" type="text" placeholder="Tìm kiếm..." value="${insSearch}" oninput="insSearch=this.value;insRenderBody()">
      <div class="ins-filters">
        <button class="ins-fbtn ${insFilter==='all'?'active':''}" onclick="insSetFilter('all')">Tất cả</button>
        <button class="ins-fbtn ${insFilter==='undone'?'active':''}" onclick="insSetFilter('undone')">Chưa xong</button>
        <button class="ins-fbtn ${insFilter==='critical'?'active':''}" onclick="insSetFilter('critical')">Quan trọng</button>
        <button class="ins-fbtn ${insFilter==='done'?'active':''}" onclick="insSetFilter('done')">Hoàn tất</button>
      </div>
      <div class="ins-tabs">
        <button class="ins-tab ${insPhase==='all'?'active':''}" onclick="insSetPhase('all')">Tất cả</button>
        ${INSPECT_PHASES.map(p=>{
          const pi=all.filter(i=>i.phaseId===p.id);
          const pd=pi.filter(i=>insState.checks[i.id]).length;
          return `<button class="ins-tab ${insPhase===p.id?'active':''}" onclick="insSetPhase('${p.id}')">${p.num} ${pd}/${pi.length}</button>`;
        }).join('')}
      </div>
    </div>
    <div id="ins-body"></div>
  `;
  page.innerHTML=html;
  insRenderBody();
}

function insSetFilter(f){insFilter=f;loadInspect()}
function insSetPhase(p){insPhase=p;loadInspect()}

function insRenderBody(){
  const container=document.getElementById('ins-body');
  if(!container)return;
  const phases=insPhase==='all'?INSPECT_PHASES:INSPECT_PHASES.filter(p=>p.id===insPhase);
  let html='';

  phases.forEach(p=>{
    let hasVisible=false;
    let bodyHtml='';

    if(p.note){
      bodyHtml+=`<div class="ins-note ${p.note.type==='warn'?'ins-note-warn':'ins-note-info'}">${p.note.text}</div>`;
    }

    p.groups.forEach((g,gi)=>{
      let groupItems='';
      g.items.forEach((item,ii)=>{
        const id=insItemId(p.id,gi,ii);
        const checked=!!insState.checks[id];
        const note=insState.notes[id]||'';

        if(insFilter==='done'&&!checked)return;
        if(insFilter==='undone'&&checked)return;
        if(insFilter==='critical'&&!insIsCritical(item))return;
        if(insSearch){
          const s=insSearch.toLowerCase();
          const match=(item.text+' '+(item.detail||'')+' '+(item.tags||[]).map(t=>t[1]).join(' ')).toLowerCase().includes(s);
          if(!match)return;
        }

        hasVisible=true;
        let tagsHtml='';
        if(item.tags){
          item.tags.forEach(([type,label])=>{
            tagsHtml+=`<span class="ins-tg ${INS_TAG_CLS[type]||'ins-tg-h'}">${label}</span>`;
          });
        }

        groupItems+=`<div class="ins-item ${checked?'ins-done':''}" data-id="${id}">
          <input type="checkbox" ${checked?'checked':''} onchange="insToggle('${id}',this.checked)">
          <div class="ins-item-body">
            <div class="ins-item-text">${item.text}</div>
            ${item.detail?`<div class="ins-item-detail">${item.detail}</div>`:''}
            ${tagsHtml?`<div class="ins-item-tags">${tagsHtml}</div>`:''}
            <button class="ins-note-btn" onclick="insToggleNote('${id}',this)">${note?'Ghi chú':'+ Ghi chú'}</button>
            <textarea class="ins-note-area ${note?'show':''}" data-id="${id}" placeholder="Ghi chú kiểm tra..." oninput="insState.notes[this.dataset.id]=this.value;insSaveState()">${note}</textarea>
          </div>
        </div>`;
      });

      if(groupItems){
        bodyHtml+=`<div class="ins-grp-title">${g.name}</div>${groupItems}`;
      }
    });

    if(!hasVisible&&(insFilter!=='all'||insSearch))return;

    const items=insAllItems().filter(i=>i.phaseId===p.id);
    const done=items.filter(i=>insState.checks[i.id]).length;
    const isOpen=insPhase!=='all'||phases.length===1;

    html+=`<div class="ins-phase ${isOpen?'open':''}">
      <div class="ins-phase-hdr" onclick="this.parentElement.classList.toggle('open')">
        <svg class="ins-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 5l7 7-7 7"/></svg>
        <span class="ins-phase-num">${p.num}</span>
        <span class="ins-phase-title">${p.title}</span>
        <span class="ins-phase-cnt">${done}/${items.length}</span>
      </div>
      <div class="ins-phase-body">${bodyHtml}</div>
    </div>`;
  });

  container.innerHTML=html;
}

function insToggle(id,checked){
  insState.checks[id]=checked;
  insSaveState();
  loadInspect();
}

function insToggleNote(id,btn){
  const ta=btn.nextElementSibling;
  ta.classList.toggle('show');
  if(ta.classList.contains('show'))ta.focus();
}
