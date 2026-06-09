# 04. AppSheet와 Looker Studio(Data Studio) 실습

## 목표

03 Apps Script 실습에서 만든 Google Sheet를 두 가지 화면으로 확장합니다.

| 도구 | 역할 |
|---|---|
| AppSheet | 담당자가 리스크 조치 상태를 바꾸는 업무 앱 |
| Looker Studio(Data Studio) | 리스크 현황을 보는 대시보드 |

먼저 03 실습에서 아래 메뉴를 실행해 둡니다.

```text
Risk Lab > 2. Run fast refresh (World Bank only)
```

그 다음 Google Sheet에 아래 두 탭이 비어 있지 않은지 확인합니다.

- `Dashboard_Mart`
- `AppSheet_Actions`

## A. AppSheet 최소 실습

### AppSheet에서 사용할 테이블

AppSheet에는 두 탭만 연결합니다.

| Google Sheet 탭 | AppSheet에서 사용할 이름 |
|---|---|
| `Dashboard_Mart` | `Risks` |
| `AppSheet_Actions` | `Actions` |

다음 탭은 AppSheet 앱에 넣지 않습니다.

- `Config_Countries`
- `Raw_WorldBank_Indicators`
- `Raw_GDELT_News`
- `Run_Log`
- `시트1`
- `Sheet1`

### 1단계: 앱 만들기

1. [AppSheet](https://www.appsheet.com/)에 접속한다.
2. `Create`를 누른다.
3. `Start with existing data`를 선택한다.
4. 03 실습에서 만든 Google Sheet를 선택한다.
5. 앱이 자동 생성되면 편집 화면으로 들어간다.

AppSheet가 여러 시트 탭을 자동으로 추가해도 괜찮다. 다음 단계에서 정리한다.

### 2단계: 필요한 테이블만 남기기

왼쪽 메뉴에서 `Data`로 간다.

남길 테이블:

- `Dashboard_Mart`
- `AppSheet_Actions`

필요 없는 테이블은 AppSheet 앱에서 제거한다.

주의:

- 원본 Google Sheet 탭을 삭제하는 것이 아니다.
- AppSheet 앱에 연결된 table만 제거한다.

### 3단계: 테이블 이름 바꾸기

가능하면 이름을 아래처럼 바꾼다.

| 기존 이름 | 바꿀 이름 |
|---|---|
| `Dashboard_Mart` | `Risks` |
| `AppSheet_Actions` | `Actions` |

이름을 바꾸지 않아도 동작하지만, 수업에서는 `Risks`, `Actions`라고 부른다.

### 4단계: Key 확인

`Data > Columns`에서 확인한다.

| 테이블 | Key 컬럼 | Label 컬럼 |
|---|---|---|
| `Risks` | `risk_id` | `country_name` |
| `Actions` | `action_id` | `action_title` |

자동으로 잘 잡혀 있으면 그대로 둔다.

### 5단계: status 선택값 만들기

`Actions` 테이블의 `status` 컬럼을 선택한다.

Type을 `Enum`으로 바꾸고 값을 넣는다.

```text
Open
In Review
Waiting
Done
Dropped
```

이제 상태를 직접 입력하지 않고 선택할 수 있다.

### 6단계: 화면 3개만 남기기

`App > Views`로 이동한다.

최소 실습에서는 아래 3개 화면만 사용한다.

| 화면 | View type | 데이터 | 설정 |
|---|---|---|---|
| `Risks` | Table | `Risks` | `risk_score` 내림차순 |
| `Actions` | Table | `Actions` | `status`로 그룹 |
| `Console` | Dashboard | `Risks`, `Actions` | 두 화면을 한 번에 보기 |

자동 생성된 다른 화면은 숨기거나 삭제한다.

### 7단계: 테스트

1. 앱에서 `Actions` 화면을 연다.
2. 조치 항목 하나를 선택한다.
3. `status`를 `Open`에서 `In Review`로 바꾼다.
4. 저장한다.
5. Google Sheets의 `AppSheet_Actions` 탭에서 status 값이 바뀌었는지 확인한다.

이 테스트가 성공하면 AppSheet 실습은 성공이다.

## B. Looker Studio(Data Studio) 실습

### 사용할 데이터

Looker Studio에는 `Dashboard_Mart` 탭 하나만 연결합니다.

이유:

- Looker Studio는 보고 화면을 만드는 도구다.
- 원천 탭 여러 개보다 대시보드용으로 정리된 단일 탭이 연결하기 쉽다.
- `Dashboard_Mart`는 Apps Script가 이미 보고용으로 정리한 테이블이다.

### 1단계: 보고서 만들기

1. [Looker Studio](https://lookerstudio.google.com/)에 접속한다.
2. `Create` 또는 `Blank report`를 선택한다.
3. 데이터 소스로 `Google Sheets`를 선택한다.
4. 03 실습에서 만든 Google Sheet를 선택한다.
5. Worksheet는 `Dashboard_Mart`를 선택한다.
6. 보고서를 만든다.

### 2단계: 기본 필드 확인

아래 필드가 숫자로 인식되는지 확인한다.

- `exports_usd`
- `imports_usd`
- `trade_balance_usd`
- `risk_score`
- `export_yoy_pct`
- `import_yoy_pct`

문자로 인식되면 필드 타입을 Number 또는 Currency로 바꾼다.

### 3단계: 필터 추가

보고서 상단에 필터 컨트롤을 추가한다.

추천 필터:

- `year`
- `region`
- `country_name`
- `risk_level`

### 4단계: Scorecard 추가

상단에 Scorecard를 만든다.

추천 지표:

| Scorecard | Metric |
|---|---|
| 평균 위험 점수 | `risk_score` |
| 총 수출액 | `exports_usd` |
| 총 수입액 | `imports_usd` |
| 총 무역수지 | `trade_balance_usd` |

### 5단계: 차트 추가

차트 1: 국가별 위험 점수

| 설정 | 값 |
|---|---|
| 차트 | Bar chart |
| Dimension | `country_name` |
| Metric | `risk_score` |
| Sort | `risk_score` 내림차순 |

차트 2: 무역수지 비교

| 설정 | 값 |
|---|---|
| 차트 | Bar chart |
| Dimension | `country_name` |
| Metric | `trade_balance_usd` |

차트 3: 상세 테이블

| 설정 | 값 |
|---|---|
| 차트 | Table |
| Dimensions | `country_name`, `year`, `risk_level`, `risk_drivers`, `recommended_action` |
| Metrics | `risk_score` |

### 6단계: 확인

아래 질문에 답할 수 있으면 Looker Studio 실습은 성공이다.

- 2024년 기준 위험 점수가 높은 국가는 어디인가?
- 무역수지가 악화된 국가는 어디인가?
- 어떤 원인 때문에 위험 점수가 올라갔는가?
- AppSheet에서 담당자가 조치할 항목은 무엇인가?

## AppSheet와 Looker Studio 차이

| 구분 | AppSheet | Looker Studio |
|---|---|---|
| 목적 | 업무 처리 | 현황 보고 |
| 주 사용 탭 | `AppSheet_Actions` | `Dashboard_Mart` |
| 사용자가 수정하는가 | 예, status 등 | 보통 아니오 |
| 수업 성공 기준 | 상태 변경이 Sheet에 반영됨 | 필터와 차트로 리스크를 설명함 |

## 자주 막히는 지점

### AppSheet에 원하지 않는 시트가 들어왔을 때

`Data`에서 필요 없는 table을 제거한다. Google Sheet 원본 탭은 삭제하지 않는다.

### Slice를 못 찾겠을 때

이번 최소 실습에서는 Slice를 만들 필요 없다.

### Board/Kanban view가 없을 때

이번 실습에서는 `Table` view에 `status` 그룹을 적용하면 충분하다.

### Looker Studio에서 데이터가 비어 있을 때

Google Sheets에서 `Dashboard_Mart`에 행이 있는지 확인한다.

없으면 03 실습으로 돌아가 아래 메뉴를 다시 실행한다.

```text
Risk Lab > 2. Run fast refresh (World Bank only)
```
