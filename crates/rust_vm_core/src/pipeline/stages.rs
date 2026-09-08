//! Composable Pipeline Stages for the Deterministic Rust Transformation Engine.

use std::marker::PhantomData;

pub trait PipelineStage<Input, Output> {
    type Error;
    fn execute(&self, input: Input) -> Result<Output, Self::Error>;
}

/// Combinator to chain two stages together into a single pipeline step.
pub struct StageChain<StageA, StageB, Mid> {
    pub stage_a: StageA,
    pub stage_b: StageB,
    _marker: PhantomData<fn() -> Mid>,
}

impl<StageA, StageB, Mid> StageChain<StageA, StageB, Mid> {
    pub fn new(stage_a: StageA, stage_b: StageB) -> Self {
        Self {
            stage_a,
            stage_b,
            _marker: PhantomData,
        }
    }
}

impl<StageA, StageB, In, Mid, Out> PipelineStage<In, Out> for StageChain<StageA, StageB, Mid>
where
    StageA: PipelineStage<In, Mid>,
    StageB: PipelineStage<Mid, Out, Error = <StageA as PipelineStage<In, Mid>>::Error>,
{
    type Error = <StageA as PipelineStage<In, Mid>>::Error;

    fn execute(&self, input: In) -> Result<Out, Self::Error> {
        let mid = self.stage_a.execute(input)?;
        self.stage_b.execute(mid)
    }
}
