"use client"

import type React from "react"
import { useState, useMemo } from "react"
import ComponentsList from "@/components/components-list"
import Header from "@/components/header"
import UploadArea from "@/components/upload-area"
import CanvasArea from "@/components/canvas/canvas-area"
import Footer from "@/components/footer"
import { Search, ChevronsUpDown } from 'lucide-react'
import * as XLSX from 'xlsx'


interface Coord {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  confidence?: number
}

export interface OcrItem {
  code: string
  description: string | null
  count: number
  coords: Coord[]
}

const fakeData: OcrItem[] = [
  { 'code': '6GFSDC', 'description': '自動両引き扉（特定防火設備）3方枠有効 W1800 x H2300 窓付（有効：W940 x H1200）', 'count': 3, 'coords': [{ 'id': '1', 'name': '0', 'x': 4121, 'y': 2307, 'width': 85, 'height': 85, 'confidence': 0.928 }, { 'id': '23', 'name': '0', 'x': 4117, 'y': 1453, 'width': 85, 'height': 86, 'confidence': 0.911 }, { 'id': '38', 'name': '0', 'x': 3227, 'y': 1379, 'width': 85, 'height': 85, 'confidence': 0.91 }] },
  { 'code': '2GADMC', 'description': "", 'count': 9, 'coords': [{ 'id': '2', 'name': '0', 'x': 2147, 'y': 2888, 'width': 86, 'height': 85, 'confidence': 0.919 }, { 'id': '8', 'name': '0', 'x': 3862, 'y': 1527, 'width': 87, 'height': 85, 'confidence': 0.914 }, { 'id': '18', 'name': '0', 'x': 3469, 'y': 2205, 'width': 86, 'height': 86, 'confidence': 0.911 }, { 'id': '27', 'name': '0', 'x': 1317, 'y': 1338, 'width': 86, 'height': 85, 'confidence': 0.911 }, { 'id': '30', 'name': '0', 'x': 2371, 'y': 1344, 'width': 87, 'height': 86, 'confidence': 0.911 }, { 'id': '65', 'name': '0', 'x': 2146, 'y': 1941, 'width': 87, 'height': 86, 'confidence': 0.907 }, { 'id': '69', 'name': '0', 'x': 1044, 'y': 802, 'width': 85, 'height': 84, 'confidence': 0.907 }, { 'id': '70', 'name': '0', 'x': 3469, 'y': 1553, 'width': 86, 'height': 85, 'confidence': 0.906 }, { 'id': '74', 'name': '0', 'x': 3953, 'y': 2205, 'width': 86, 'height': 85, 'confidence': 0.906 }] },
  { 'code': '1GFSDC', 'description': '両開き扉（特定防火設備）3方枠 有効 W1600 x H2000 窓付（有効：W500 x H600）', 'count': 1, 'coords': [{ 'id': '3', 'name': '0', 'x': 993, 'y': 3129, 'width': 86, 'height': 85, 'confidence': 0.916 }] },
  { 'code': '8GFSDC', 'description': "", 'count': 1, 'coords': [{ 'id': '4', 'name': '0', 'x': 1386, 'y': 3165, 'width': 84, 'height': 84, 'confidence': 0.915 }] },
  { 'code': '6bADC', 'description': '壁片開き点検扉（サンワイズ）エアタイト 有効 W450 x H450 アルミ 4方枠 表面材 内外抗菌鋼板 / 壁取付 2', 'count': 2, 'coords': [{ 'id': '6', 'name': '0', 'x': 3405, 'y': 2964, 'width': 85, 'height': 85, 'confidence': 0.914 }, { 'id': '12', 'name': '0', 'x': 1763, 'y': 2949, 'width': 85, 'height': 83, 'confidence': 0.913 }] },
  { 'code': '11GaFSDC', 'description': '片開き扉（防火設備）4方枠有効 W800 x H2000 窓付（有効：W500 x H600）', 'count': 2, 'coords': [{ 'id': '7', 'name': '0', 'x': 4332, 'y': 3041, 'width': 86, 'height': 85, 'confidence': 0.914 }, { 'id': '15', 'name': '0', 'x': 4138, 'y': 703, 'width': 86, 'height': 86, 'confidence': 0.913 }] },
  { 'code': '4aFSDC', 'description': '面開き扉（特定防火設備）4方枠有効 W3000 x H2400', 'count': 2, 'coords': [{ 'id': '9', 'name': '0', 'x': 2877, 'y': 589, 'width': 85, 'height': 85, 'confidence': 0.914 }, { 'id': '44', 'name': '0', 'x': 2818, 'y': 3056, 'width': 88, 'height': 85, 'confidence': 0.909 }] },
  { 'code': '4GADMC', 'description': "", 'count': 2, 'coords': [{ 'id': '11', 'name': '0', 'x': 1015, 'y': 2935, 'width': 85, 'height': 85, 'confidence': 0.913 }, { 'id': '42', 'name': '0', 'x': 1666, 'y': 2935, 'width': 85, 'height': 86, 'confidence': 0.909 }] },
  { 'code': '3GaADC', 'description': '両開き扉 エアタイト 有効 W1600 x H2000 アルミ 4方枠 窓付（枠外：口600） 透明ガラス 6.8t 表面材 内外抗菌鋼板', 'count': 1, 'coords': [{ 'id': '16', 'name': '0', 'x': 4717, 'y': 579, 'width': 84, 'height': 86, 'confidence': 0.912 }] },
  { 'code': '9GFSDC', 'description': '自動両引スライド扉（防火設備）3方枠有効 W1800 x H2000 窓付（有効：W935 x H900）', 'count': 1, 'coords': [{ 'id': '19', 'name': '0', 'x': 1027, 'y': 1337, 'width': 86, 'height': 86, 'confidence': 0.911 }] },
  { 'code': '3GaFSDC', 'description': '片開き扉（特定防火設備）4方枠有効 W800 x H2000 窓付（有効：W500 x H600）', 'count': 8, 'coords': [{ 'id': '22', 'name': '0', 'x': 3549, 'y': 589, 'width': 86, 'height': 85, 'confidence': 0.911 }, { 'id': '32', 'name': '0', 'x': 3671, 'y': 3056, 'width': 85, 'height': 85, 'confidence': 0.911 }, { 'id': '35', 'name': '0', 'x': 2423, 'y': 3025, 'width': 86, 'height': 85, 'confidence': 0.91 }, { 'id': '36', 'name': '0', 'x': 2558, 'y': 594, 'width': 84, 'height': 84, 'confidence': 0.91 }, { 'id': '46', 'name': '0', 'x': 1688, 'y': 594, 'width': 85, 'height': 84, 'confidence': 0.909 }, { 'id': '52', 'name': '0', 'x': 856, 'y': 1564, 'width': 86, 'height': 86, 'confidence': 0.908 }, { 'id': '57', 'name': '0', 'x': 2609, 'y': 3161, 'width': 85, 'height': 85, 'confidence': 0.908 }, { 'id': '83', 'name': '0', 'x': 1837, 'y': 3161, 'width': 87, 'height': 85, 'confidence': 0.904 }] },
  { 'code': '2GaFSDC', 'description': '面開き扉（特定防火設備）4方枠 有効 W1800 x H2000 窓付（有効：W500 x H600）', 'count': 1, 'coords': [{ 'id': '24', 'name': '0', 'x': 1024, 'y': 2625, 'width': 87, 'height': 85, 'confidence': 0.911 }] },
  { 'code': '5GFSDC', 'description': '自動両引き扉（特定防火設備）3方枠有効 W1800 x H2000 窓付（有効：W940 x H900）', 'count': 3, 'coords': [{ 'id': '26', 'name': '0', 'x': 1602, 'y': 2273, 'width': 86, 'height': 85, 'confidence': 0.911 }, { 'id': '28', 'name': '0', 'x': 2389, 'y': 2210, 'width': 85, 'height': 86, 'confidence': 0.911 }, { 'id': '68', 'name': '0', 'x': 2822, 'y': 2042, 'width': 86, 'height': 85, 'confidence': 0.907 }] },
  { 'code': '2FAWC', 'description': 'FIX窓（特定防火設備） 有効 W1300 x H1000 廊下側プラインド付', 'count': 12, 'coords': [{ 'id': '39', 'name': '0', 'x': 1034, 'y': 1918, 'width': 86, 'height': 86, 'confidence': 0.91 }, { 'id': '41', 'name': '0', 'x': 3010, 'y': 694, 'width': 85, 'height': 85, 'confidence': 0.91 }, { 'id': '43', 'name': '0', 'x': 2320, 'y': 3161, 'width': 86, 'height': 85, 'confidence': 0.909 }, { 'id': '48', 'name': '0', 'x': 3735, 'y': 3161, 'width': 85, 'height': 85, 'confidence': 0.909 }, { 'id': '63', 'name': '0', 'x': 3146, 'y': 3162, 'width': 87, 'height': 85, 'confidence': 0.907 }, { 'id': '67', 'name': '0', 'x': 2995, 'y': 3161, 'width': 86, 'height': 85, 'confidence': 0.907 }, { 'id': '71', 'name': '0', 'x': 3670, 'y': 694, 'width': 86, 'height': 85, 'confidence': 0.906 }, { 'id': '73', 'name': '0', 'x': 1527, 'y': 694, 'width': 86, 'height': 85, 'confidence': 0.906 }, { 'id': '76', 'name': '0', 'x': 2066, 'y': 3161, 'width': 85, 'height': 86, 'confidence': 0.905 }, { 'id': '88', 'name': '0', 'x': 1049, 'y': 2403, 'width': 85, 'height': 84, 'confidence': 0.902 }, { 'id': '91', 'name': '0', 'x': 2445, 'y': 586, 'width': 85, 'height': 85, 'confidence': 0.9 }, { 'id': '98', 'name': '0', 'x': 3451, 'y': 3066, 'width': 84, 'height': 84, 'confidence': 0.886 }] },
  { 'code': '4FAWC', 'description': 'FIX密（特定防火設備）有効 W900 x H1000', 'count': 1, 'coords': [{ 'id': '50', 'name': '0', 'x': 4117, 'y': 1245, 'width': 84, 'height': 85, 'confidence': 0.908 }] },
  { 'code': '1AWC', 'description': '複層FIX窓（サンワイズ PW）有効 W1500 x H1100樹脂枠 FL-FL⑤12⑤強化', 'count': 2, 'coords': [{ 'id': '55', 'name': '0', 'x': 1271, 'y': 1733, 'width': 85, 'height': 85, 'confidence': 0.908 }, { 'id': '64', 'name': '0', 'x': 1271, 'y': 968, 'width': 85, 'height': 86, 'confidence': 0.907 }] },
  { 'code': '3GADMC', 'description': '自動両引きスライド扉 有効 W1800 x H2300 アルミ枠 3方枠 窓付（枠外：☐600）透明ガラス 6.8 t 表面材 内外抗菌鋼板', 'count': 4, 'coords': [{ 'id': '58', 'name': '0', 'x': 2612, 'y': 872, 'width': 86, 'height': 86, 'confidence': 0.908 }, { 'id': '81', 'name': '0', 'x': 2486, 'y': 2914, 'width': 86, 'height': 85, 'confidence': 0.904 }, { 'id': '85', 'name': '0', 'x': 2491, 'y': 1953, 'width': 85, 'height': 85, 'confidence': 0.903 }, { 'id': '87', 'name': '0', 'x': 3220, 'y': 2320, 'width': 85, 'height': 85, 'confidence': 0.902 }] },
  { 'code': '5GADC', 'description': '自開片引きスライド扉有効 W900 x H2000アルミ3方枠 窓付（枠外：口600） スリガラス5t表面材 内外抗菌鋼板', 'count': 2, 'coords': [{ 'id': '60', 'name': '0', 'x': 1168, 'y': 3049, 'width': 86, 'height': 85, 'confidence': 0.908 }, { 'id': '96', 'name': '0', 'x': 1583, 'y': 3064, 'width': 85, 'height': 84, 'confidence': 0.894 }] },
  { 'code': '1FAWC', 'description': 'FIX密（特定防火設備）有効 W1300x H1000', 'count': 4, 'coords': [{ 'id': '62', 'name': '0', 'x': 4117, 'y': 2645, 'width': 84, 'height': 85, 'confidence': 0.907 }, { 'id': '86', 'name': '0', 'x': 3996, 'y': 738, 'width': 86, 'height': 86, 'confidence': 0.903 }, { 'id': '89', 'name': '0', 'x': 4117, 'y': 2900, 'width': 85, 'height': 86, 'confidence': 0.901 }, { 'id': '93', 'name': '0', 'x': 4117, 'y': 1900, 'width': 84, 'height': 87, 'confidence': 0.899 }] },
  { 'code': '3FAWC', 'description': 'FIX窓（防火設備） 有効 W1300 x H1000 廊下側プラインド付', 'count': 2, 'coords': [{ 'id': '66', 'name': '0', 'x': 4235, 'y': 585, 'width': 87, 'height': 85, 'confidence': 0.907 }, { 'id': '78', 'name': '0', 'x': 4215, 'y': 3162, 'width': 86, 'height': 84, 'confidence': 0.905 }] },
  { 'code': '1GADMC', 'description': "", 'count': 1, 'coords': [{ 'id': '77', 'name': '0', 'x': 3749, 'y': 2206, 'width': 86, 'height': 85, 'confidence': 0.905 }] },
  { 'code': '2GADC', 'description': '片開き扉有効 W900 x H2000 アルミ 3方枠 窓付（枠外：口600）透明ガラス6.8t 表面材 内外抗菌鋼板', 'count': 2, 'coords': [{ 'id': '79', 'name': '0', 'x': 999, 'y': 2500, 'width': 85, 'height': 86, 'confidence': 0.905 }, { 'id': '92', 'name': '0', 'x': 1244, 'y': 2368, 'width': 86, 'height': 85, 'confidence': 0.9 }] },
  { 'code': '10GFSDC', 'description': '片開き扉（防火設備）3方枠有効 W800 x H2000 窓付（有効：W500 x H600）', 'count': 1, 'coords': [{ 'id': '80', 'name': '0', 'x': 836, 'y': 1013, 'width': 86, 'height': 85, 'confidence': 0.905 }] },
  { 'code': '7GFSDC', 'description': '自動片引き扉（特定防火設備）3方枠有効 W1325 x H2000 窓付（有効：W1370 x H900）', 'count': 1, 'coords': [{ 'id': '82', 'name': '0', 'x': 1040, 'y': 2095, 'width': 86, 'height': 86, 'confidence': 0.904 }] },
  { 'code': '1GaFSDC', 'description': '面開き扉（特定防火設備）4方枠有効 W1600 x H2000 窓付（有効：W447 x H640）', 'count': 1, 'coords': [{ 'id': '90', 'name': '0', 'x': 1189, 'y': 593, 'width': 85, 'height': 86, 'confidence': 0.901 }] },
  { 'code': '1C', 'description': "", 'count': 1, 'coords': [{ 'id': '94', 'name': '0', 'x': 1004, 'y': 2733, 'width': 85, 'height': 84, 'confidence': 0.897 }] },
  { 'code': '1GADC', 'description': '自開片引きスライド扉有効 W900 x H2000 アルミ3方枠 窓付（枠外：☐600）透明ガラス6.8t 表面材 内外抗菌鋼板', 'count': 2, 'coords': [{ 'id': '95', 'name': '0', 'x': 1294, 'y': 3064, 'width': 85, 'height': 82, 'confidence': 0.896 }, { 'id': '97', 'name': '0', 'x': 1460, 'y': 3064, 'width': 85, 'height': 83, 'confidence': 0.891 }] },
]

const fakeData2: OcrItem[] = [
  { 'code': '14GaFSDC', 'description': '片開き扉（特定防火設備）4方枠 有効 W900 x H1800 窓付（有効：W561xH640） FライトプラスA8.6mm', 'count': 3, 'coords': [{ 'id': '1', 'name': '0', 'x': 3185, 'y': 1373, 'width': 86, 'height': 84, 'confidence': 0.925 }, { 'id': '14', 'name': '0', 'x': 3946, 'y': 2365, 'width': 87, 'height': 86, 'confidence': 0.914 }, { 'id': '31', 'name': '0', 'x': 3951, 'y': 1461, 'width': 87, 'height': 86, 'confidence': 0.904 }] },
  { 'code': '2GaADC', 'description': '片開き扉（サンワイズ）エアタイト / 18<ucel> / 有効 W900 x H1800 / 4方枠 窓付（枠外：口600）菱網6.8t透明ガラス / 表面材 内外抗菌鋼板', 'count': 18, 'coords': [{ 'id': '2', 'name': '0', 'x': 1409, 'y': 2400, 'width': 86, 'height': 85, 'confidence': 0.923 }, { 'id': '3', 'name': '0', 'x': 1413, 'y': 2267, 'width': 86, 'height': 86, 'confidence': 0.922 }, { 'id': '4', 'name': '0', 'x': 2460, 'y': 2911, 'width': 86, 'height': 86, 'confidence': 0.922 }, { 'id': '5', 'name': '0', 'x': 3741, 'y': 1798, 'width': 86, 'height': 85, 'confidence': 0.921 }, { 'id': '6', 'name': '0', 'x': 2472, 'y': 1953, 'width': 85, 'height': 84, 'confidence': 0.92 }, { 'id': '7', 'name': '0', 'x': 1667, 'y': 2561, 'width': 86, 'height': 87, 'confidence': 0.916 }, { 'id': '11', 'name': '0', 'x': 3483, 'y': 1262, 'width': 88, 'height': 85, 'confidence': 0.915 }, { 'id': '15', 'name': '0', 'x': 2615, 'y': 1948, 'width': 87, 'height': 85, 'confidence': 0.913 }, { 'id': '16', 'name': '0', 'x': 1040, 'y': 1288, 'width': 87, 'height': 86, 'confidence': 0.913 }, { 'id': '17', 'name': '0', 'x': 2449, 'y': 1126, 'width': 87, 'height': 86, 'confidence': 0.913 }, { 'id': '18', 'name': '0', 'x': 2447, 'y': 1328, 'width': 85, 'height': 86, 'confidence': 0.913 }, { 'id': '22', 'name': '0', 'x': 4184, 'y': 1559, 'width': 86, 'height': 86, 'confidence': 0.911 }, { 'id': '25', 'name': '0', 'x': 2639, 'y': 2924, 'width': 86, 'height': 86, 'confidence': 0.909 }, { 'id': '26', 'name': '0', 'x': 3134, 'y': 2279, 'width': 86, 'height': 86, 'confidence': 0.908 }, { 'id': '28', 'name': '0', 'x': 5057, 'y': 2383, 'width': 87, 'height': 86, 'confidence': 0.906 }, { 'id': '30', 'name': '0', 'x': 3376, 'y': 2365, 'width': 87, 'height': 87, 'confidence': 0.904 }, { 'id': '32', 'name': '0', 'x': 4232, 'y': 2321, 'width': 86, 'height': 85, 'confidence': 0.903 }, { 'id': '33', 'name': '0', 'x': 4711, 'y': 2475, 'width': 86, 'height': 86, 'confidence': 0.903 }] },
  { 'code': '12GaFSDC', 'description': '片開き扉（特定防火設備）4方枠有効 W900 x H1800 窓付（有効：W561xH640） FライトプラスA8.6mm', 'count': 2, 'coords': [{ 'id': '8', 'name': '0', 'x': 2687, 'y': 2240, 'width': 86, 'height': 85, 'confidence': 0.916 }, { 'id': '10', 'name': '0', 'x': 1016, 'y': 2109, 'width': 87, 'height': 85, 'confidence': 0.915 }] },
  { 'code': '4aADC', 'description': '両開き扉（サンワイズ）エアタイト有効 W2000 x H1600アルミ4方枠 窓無し表面材 内外抗菌鋼板', 'count': 2, 'coords': [{ 'id': '19', 'name': '0', 'x': 4537, 'y': 907, 'width': 85, 'height': 84, 'confidence': 0.913 }, { 'id': '29', 'name': '0', 'x': 4585, 'y': 692, 'width': 86, 'height': 85, 'confidence': 0.906 }] },
  { 'code': '13aFSDC', 'description': '片開き扉有効 W900 x H1500 アルミ 4方枠 窓付（有効：口600） 菱網6.8t透明ガラス', 'count': 1, 'coords': [{ 'id': '20', 'name': '0', 'x': 1034, 'y': 3077, 'width': 86, 'height': 86, 'confidence': 0.913 }] },
  { 'code': '6aADC', 'description': '天井片開き点検扉（サンワイズ）エアタイト有効 W450 x H450アルミ4方枠表面材 内外抗菌鋼板', 'count': 2, 'coords': [{ 'id': '24', 'name': '0', 'x': 1276, 'y': 2588, 'width': 85, 'height': 87, 'confidence': 0.91 }, { 'id': '34', 'name': '0', 'x': 4752, 'y': 2898, 'width': 87, 'height': 84, 'confidence': 0.902 }] },
]

const fakeData3: OcrItem[] = [
  { 'code': '5GFSDC', 'description': "", 'count': 3, 'coords': [{ 'id': '1', 'name': '0', 'x': 3273, 'y': 1133, 'width': 86, 'height': 84, 'confidence': 0.916 }, { 'id': '3', 'name': '0', 'x': 5261, 'y': 1066, 'width': 86, 'height': 85, 'confidence': 0.915 }, { 'id': '7', 'name': '0', 'x': 6228, 'y': 1066, 'width': 86, 'height': 85, 'confidence': 0.911 }] },
  { 'code': '6bADC', 'description': "", 'count': 1, 'coords': [{ 'id': '2', 'name': '0', 'x': 3813, 'y': 3270, 'width': 86, 'height': 85, 'confidence': 0.915 }] },
  { 'code': '2GaFSDC', 'description': "", 'count': 1, 'coords': [{ 'id': '4', 'name': '0', 'x': 1956, 'y': 2264, 'width': 86, 'height': 86, 'confidence': 0.913 }] },
  { 'code': '3GaFSDC', 'description': "", 'count': 3, 'coords': [{ 'id': '5', 'name': '0', 'x': 5388, 'y': 3426, 'width': 86, 'height': 86, 'confidence': 0.912 }, { 'id': '20', 'name': '0', 'x': 6091, 'y': 3408, 'width': 87, 'height': 87, 'confidence': 0.907 }, { 'id': '21', 'name': '0', 'x': 4087, 'y': 3450, 'width': 87, 'height': 86, 'confidence': 0.907 }] },
  { 'code': '1GADC', 'description': "", 'count': 2, 'coords': [{ 'id': '6', 'name': '0', 'x': 2728, 'y': 3485, 'width': 86, 'height': 85, 'confidence': 0.911 }, { 'id': '8', 'name': '0', 'x': 2320, 'y': 3590, 'width': 85, 'height': 86, 'confidence': 0.911 }] },
  { 'code': '2GADMC', 'description': "", 'count': 2, 'coords': [{ 'id': '9', 'name': '0', 'x': 4762, 'y': 3096, 'width': 86, 'height': 86, 'confidence': 0.91 }, { 'id': '11', 'name': '0', 'x': 4761, 'y': 615, 'width': 87, 'height': 85, 'confidence': 0.91 }] },
  { 'code': '7GFSDC', 'description': "", 'count': 1, 'coords': [{ 'id': '10', 'name': '0', 'x': 2121, 'y': 1165, 'width': 86, 'height': 86, 'confidence': 0.91 }] },
  { 'code': '2GADC', 'description': "", 'count': 2, 'coords': [{ 'id': '12', 'name': '0', 'x': 2181, 'y': 1850, 'width': 86, 'height': 85, 'confidence': 0.91 }, { 'id': '27', 'name': '0', 'x': 2378, 'y': 1722, 'width': 84, 'height': 85, 'confidence': 0.901 }] },
  { 'code': '2FAWC', 'description': "", 'count': 4, 'coords': [{ 'id': '13', 'name': '0', 'x': 1987, 'y': 1363, 'width': 85, 'height': 86, 'confidence': 0.91 }, { 'id': '14', 'name': '0', 'x': 1979, 'y': 525, 'width': 86, 'height': 86, 'confidence': 0.91 }, { 'id': '25', 'name': '0', 'x': 5180, 'y': 3486, 'width': 86, 'height': 85, 'confidence': 0.905 }, { 'id': '26', 'name': '0', 'x': 4262, 'y': 3457, 'width': 86, 'height': 85, 'confidence': 0.903 }] },
  { 'code': '3GADMC', 'description': "", 'count': 2, 'coords': [{ 'id': '15', 'name': '0', 'x': 5627, 'y': 659, 'width': 86, 'height': 85, 'confidence': 0.909 }, { 'id': '23', 'name': '0', 'x': 5624, 'y': 3061, 'width': 85, 'height': 85, 'confidence': 0.905 }] },
  { 'code': '4GADMC', 'description': "", 'count': 2, 'coords': [{ 'id': '16', 'name': '0', 'x': 3030, 'y': 2868, 'width': 85, 'height': 85, 'confidence': 0.909 }, { 'id': '18', 'name': '0', 'x': 2354, 'y': 2867, 'width': 86, 'height': 86, 'confidence': 0.908 }] },
  { 'code': '1GFSDC', 'description': "", 'count': 1, 'coords': [{ 'id': '17', 'name': '0', 'x': 2116, 'y': 3600, 'width': 85, 'height': 85, 'confidence': 0.909 }] },
  { 'code': '5GADC', 'description': "", 'count': 2, 'coords': [{ 'id': '19', 'name': '0', 'x': 3281, 'y': 3591, 'width': 86, 'height': 85, 'confidence': 0.908 }, { 'id': '24', 'name': '0', 'x': 2174, 'y': 3208, 'width': 87, 'height': 85, 'confidence': 0.905 }] },
  { 'code': '8GFSDC', 'description': "", 'count': 1, 'coords': [{ 'id': '22', 'name': '0', 'x': 2556, 'y': 3762, 'width': 86, 'height': 86, 'confidence': 0.906 }] },
  { 'code': '1C', 'description': "", 'count': 2, 'coords': [{ 'id': '28', 'name': '0', 'x': 1953, 'y': 2430, 'width': 86, 'height': 85, 'confidence': 0.893 }, { 'id': '29', 'name': '0', 'x': 2661, 'y': 2400, 'width': 86, 'height': 85, 'confidence': 0.886 }] },
]

const fakeData4: OcrItem[] = [
  {
    "code": "PDH21009",
    "description": "W:900, H:2100, 厚さ:42, モデル:内装片開扉, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 1,
    "coords": [
      {
        "id": "1",
        "name": "0",
        "x": 5570,
        "y": 566,
        "width": 128,
        "height": 127,
        "confidence": 0.921
      }
    ]
  },
  {
    "code": "PDH210014",
    "description": "W:900, H:2100, 厚さ:42, モデル:内装片開扉, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 1,
    "coords": [
      {
        "id": "2",
        "name": "0",
        "x": 2261,
        "y": 1053,
        "width": 128,
        "height": 127,
        "confidence": 0.92
      }
    ]
  },
  {
    "code": "PDH21001",
    "description": "W:900, H:2100, 厚さ:42, モデル:内装片開扉, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 9,
    "coords": [
      {
        "id": "3",
        "name": "0",
        "x": 5083,
        "y": 652,
        "width": 128,
        "height": 127,
        "confidence": 0.92
      },
      {
        "id": "4",
        "name": "0",
        "x": 5383,
        "y": 1436,
        "width": 128,
        "height": 127,
        "confidence": 0.92
      },
      {
        "id": "6",
        "name": "0",
        "x": 2664,
        "y": 1052,
        "width": 128,
        "height": 127,
        "confidence": 0.919
      },
      {
        "id": "14",
        "name": "0",
        "x": 2304,
        "y": 896,
        "width": 129,
        "height": 125,
        "confidence": 0.917
      },
      {
        "id": "20",
        "name": "0",
        "x": 2665,
        "y": 895,
        "width": 128,
        "height": 128,
        "confidence": 0.915
      },
      {
        "id": "21",
        "name": "0",
        "x": 5390,
        "y": 1274,
        "width": 128,
        "height": 126,
        "confidence": 0.915
      },
      {
        "id": "24",
        "name": "0",
        "x": 4832,
        "y": 1136,
        "width": 128,
        "height": 127,
        "confidence": 0.913
      },
      {
        "id": "26",
        "name": "0",
        "x": 4819,
        "y": 823,
        "width": 128,
        "height": 127,
        "confidence": 0.913
      },
      {
        "id": "29",
        "name": "0",
        "x": 5710,
        "y": 843,
        "width": 127,
        "height": 128,
        "confidence": 0.911
      }
    ]
  },
  {
    "code": "PDH21006",
    "description": "W:900, H:2100, 厚さ:42, モデル:内装片開扉, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 1,
    "coords": [
      {
        "id": "5",
        "name": "0",
        "x": 2664,
        "y": 320,
        "width": 128,
        "height": 127,
        "confidence": 0.919
      }
    ]
  },
  {
    "code": "PDH156516",
    "description": "W:2140, H:1565, 厚さ:42, モデル:内装両開扉, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 1,
    "coords": [
      {
        "id": "7",
        "name": "0",
        "x": 1466,
        "y": 2593,
        "width": 127,
        "height": 127,
        "confidence": 0.918
      }
    ]
  },
  {
    "code": "PDH156515",
    "description": "W:2140, H:1565, 厚さ:42, モデル:内装両開扉, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 7,
    "coords": [
      {
        "id": "8",
        "name": "0",
        "x": 4414,
        "y": 2593,
        "width": 128,
        "height": 127,
        "confidence": 0.918
      },
      {
        "id": "13",
        "name": "0",
        "x": 2647,
        "y": 2593,
        "width": 128,
        "height": 127,
        "confidence": 0.917
      },
      {
        "id": "15",
        "name": "0",
        "x": 3233,
        "y": 2593,
        "width": 128,
        "height": 127,
        "confidence": 0.917
      },
      {
        "id": "16",
        "name": "0",
        "x": 3828,
        "y": 2593,
        "width": 128,
        "height": 128,
        "confidence": 0.916
      },
      {
        "id": "17",
        "name": "0",
        "x": 5596,
        "y": 2593,
        "width": 127,
        "height": 127,
        "confidence": 0.916
      },
      {
        "id": "18",
        "name": "0",
        "x": 5009,
        "y": 2593,
        "width": 127,
        "height": 127,
        "confidence": 0.916
      },
      {
        "id": "19",
        "name": "0",
        "x": 2053,
        "y": 2593,
        "width": 127,
        "height": 127,
        "confidence": 0.916
      }
    ]
  },
  {
    "code": "PDH210012",
    "description": "W:1300, H:2100, 厚さ:42, モデル:内装両開扉, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 1,
    "coords": [
      {
        "id": "9",
        "name": "0",
        "x": 5183,
        "y": 2345,
        "width": 127,
        "height": 127,
        "confidence": 0.918
      }
    ]
  },
  {
    "code": "PDH21004",
    "description": "W:1800, H:2100, 厚さ:42, モデル:内装両開扉, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 1,
    "coords": [
      {
        "id": "10",
        "name": "0",
        "x": 4428,
        "y": 856,
        "width": 127,
        "height": 126,
        "confidence": 0.918
      }
    ]
  },
  {
    "code": "PDH21002",
    "description": "W:1300, H:2100, 厚さ:42, モデル:内装両開扉, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 2,
    "coords": [
      {
        "id": "11",
        "name": "0",
        "x": 1904,
        "y": 1769,
        "width": 128,
        "height": 127,
        "confidence": 0.918
      },
      {
        "id": "23",
        "name": "0",
        "x": 3389,
        "y": 991,
        "width": 128,
        "height": 127,
        "confidence": 0.914
      }
    ]
  },
  {
    "code": "PDH210013",
    "description": "W:1800, H:2100, 厚さ:42, モデル:内装両開扉, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 1,
    "coords": [
      {
        "id": "12",
        "name": "0",
        "x": 2634,
        "y": 1768,
        "width": 128,
        "height": 128,
        "confidence": 0.918
      }
    ]
  },
  {
    "code": "PDH21008",
    "description": "W:1800, H:2100, 厚さ:42, モデル:内装片開扉, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 1,
    "coords": [
      {
        "id": "22",
        "name": "0",
        "x": 4428,
        "y": 610,
        "width": 127,
        "height": 127,
        "confidence": 0.915
      }
    ]
  },
  {
    "code": "PDH21007",
    "description": "W:1300, H:2100, 厚さ:42, モデル:内装間仕切スライド扉片引き, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 1,
    "coords": [
      {
        "id": "25",
        "name": "0",
        "x": 2346,
        "y": 1886,
        "width": 127,
        "height": 127,
        "confidence": 0.913
      }
    ]
  },
  {
    "code": "PDH21005",
    "description": "W:900, H:2100, 厚さ:42, モデル:内装片開扉, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 1,
    "coords": [
      {
        "id": "27",
        "name": "0",
        "x": 1995,
        "y": 886,
        "width": 128,
        "height": 125,
        "confidence": 0.912
      }
    ]
  },
  {
    "code": "PDH21003",
    "description": "W:1300, H:2100, 厚さ:42, モデル:内装両開扉, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 1,
    "coords": [
      {
        "id": "28",
        "name": "0",
        "x": 1664,
        "y": 1269,
        "width": 128,
        "height": 128,
        "confidence": 0.912
      }
    ]
  },
  {
    "code": "PDH210011",
    "description": "W:1300, H:2100, 厚さ:42, モデル:内装両開扉, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 1,
    "coords": [
      {
        "id": "30",
        "name": "0",
        "x": 1271,
        "y": 863,
        "width": 128,
        "height": 127,
        "confidence": 0.91
      }
    ]
  },
  {
    "code": "PDH210010",
    "description": "W:900, H:2100, 厚さ:42, モデル:内装片開扉, 表面材:日軽カラー鋼板 (ホワイトグレー色)",
    "count": 1,
    "coords": [
      {
        "id": "31",
        "name": "0",
        "x": 1772,
        "y": 624,
        "width": 127,
        "height": 128,
        "confidence": 0.906
      }
    ]
  }
]

interface OcrTableProps {
  data: OcrItem[]
  selectedCode: string | null
  onSelectCode: (code: string | null) => void
}


function OcrTable({ data, selectedCode, onSelectCode }: OcrTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = useMemo(() => {
    return data.filter(item =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    )
  }, [data, searchTerm])

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with search box */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Found: <span className="font-semibold text-blue-600">{filteredData.length}</span> / {data.length} items
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                No.
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Count
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                  No matching results found
                </td>
              </tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr
                  key={item.code}
                  onClick={() => onSelectCode(selectedCode === item.code ? null : item.code)}
                  className={`
                    hover:bg-blue-50 cursor-pointer transition-all duration-150
                    ${selectedCode === item.code
                      ? 'bg-blue-100 ring-2 ring-blue-400 ring-inset font-medium'
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-blue-700">
                    {item.code}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700 max-w-md">
                    <div className="line-clamp-2" title={item.description || '(No description)'}>
                      {item.description || <span className="text-gray-400 italic">— No description —</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`
                      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${item.count >= 10 ? 'bg-red-100 text-red-800' :
                        item.count >= 5 ? 'bg-amber-100 text-amber-800' :
                          'bg-green-100 text-green-800'}
                    `}>
                      {item.count}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {selectedCode && (
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-200 text-sm text-blue-800 font-medium">
          Selected: <span className="font-mono">{selectedCode}</span> — Click again to deselect
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [ocrItems, setOcrItems] = useState<OcrItem[]>([]);
  const [components, setComponents] = useState<
    Array<{
      id: string
      name: string
      x: number
      y: number
      width: number
      height: number
      confidence?: number
      text?: string
    }>
  >([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null)
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [selectedCode, setSelectedCode] = useState<string | null>(null)

  const handleReset = () => {
    setUploadedImage(null)
    setOcrItems([])
    setComponents([])
    setIsDetecting(false)
    setHoveredComponentId(null)
    setSelectedComponentId(null)
    setSelectedCode(null)
  }



  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFileName(file.name.split(".")[0]);

    const reader = new FileReader()
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string
      setUploadedImage(imageUrl)

      setIsDetecting(true)
      await callDetectAPI(file)
      setIsDetecting(false)
    }
    reader.readAsDataURL(file)
  }

  const callDetectAPI = async (file: File) => {
    try {
      // await new Promise(resolve => setTimeout(resolve, 3000));
      // let dataToUse = fakeData;

      // if (file.name.includes("KG210148-旭化成_1平面_17012024-08")) {
      //   dataToUse = fakeData2;
      //   setOcrItems(fakeData2);
      // } else if (file.name.includes("KG210148-旭化成_1平面_17012024-01")) {
      //   dataToUse = fakeData;
      //   setOcrItems(fakeData);
      // } else if (file.name.includes("KG210148-旭化成_1平面_17012024-06")) {
      //   dataToUse = fakeData3;
      //   setOcrItems(fakeData3);
      // } else if (file.name.includes("3F パネル仕事ー平面図-12-19_Rev2-1")) {
      //   dataToUse = fakeData4;
      //   setOcrItems(fakeData4);
      // }


      // const allCoords = dataToUse.flatMap(item =>
      //   item.coords.map(coord => ({
      //     ...coord,
      //     text: item.description || "",
      //     name: item.code
      //   }))
      // );

      // // Set vào state
      // setComponents(allCoords);
      // return;
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("https://sequaciously-dignified-vanesa.ngrok-free.dev/detect", {
        method: "POST",
        body: formData,
      })
      console.log(response)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }

      const data = await response.json()
      if (Array.isArray(data)) {
        setComponents(data)
      } else {
        console.error("Unexpected API response:", data)
        alert("API returned unexpected data format")
      }
    } catch (error) {
      console.error("Failed to detect components:", error)
      alert("Failed to detect components. Check console for details.")
    }
  }

  const handleDeleteComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id))
  }

  const handleUpdateComponent = (id: string, updates: Partial<(typeof components)[0]>) => {
    setComponents(components.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const handleDownloadExcel = () => {
    if (ocrItems.length === 0) return;

    const excelData = ocrItems.map(item => ({
      "Code": item.code,
      "Description": item.description || "",
      "Count": item.count,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    const colWidths = [
      { wch: 15 },
      { wch: 80 },
      { wch: 12 },
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Door List");
    const fileName = `${uploadedFileName || "door_statistics"}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Header />

      <main className="flex-1 px-6 py-6 overflow-hidden">
        {!uploadedImage ? (
          <UploadArea onFileUpload={handleFileUpload} />
        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <CanvasArea
              imageUrl={uploadedImage}
              components={selectedCode
                ? components.filter(c => c.name === selectedCode)
                : components}
              onUpdateComponent={handleUpdateComponent}
              isDetecting={isDetecting}
              hoveredComponentId={hoveredComponentId}
              selectedComponentId={selectedComponentId}
              onSelectComponent={setSelectedComponentId}
              onChangeImage={handleFileUpload}
              onReset={handleReset}
            />

            <div className="lg:col-span-1 flex flex-col min-h-0">
              {/* <ComponentsList
                components={components}
                onDelete={handleDeleteComponent}
                onUpdate={handleUpdateComponent}
                isDetecting={isDetecting}
                onHoverComponent={setHoveredComponentId}
                selectedComponentId={selectedComponentId}
                onSelectComponent={setSelectedComponentId}
              /> */}
              {components.length > 0 && (
                <OcrTable
                  data={ocrItems}
                  selectedCode={selectedCode}
                  onSelectCode={setSelectedCode}
                />
              )}
            </div>
          </div>

        )}
      </main>

      {uploadedImage && (<Footer componentsCount={components.length} onDownloadExcel={handleDownloadExcel} />)}

    </div>
  )
}
